<?php
require_once __DIR__ . "/../helpers/auth.php";
require_once __DIR__ . "/../models/AccessRequest.php";
require_once __DIR__ . "/../models/Role.php";
require_once __DIR__ . "/../models/Staff.php";
require_once __DIR__ . "/../models/User.php";

class AuthService
{
    private PDO $conn;
    private User $userModel;
    private Role $roleModel;
    private Staff $staffModel;
    private AccessRequest $accessRequestModel;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        $this->userModel = new User($conn);
        $this->roleModel = new Role($conn);
        $this->staffModel = new Staff($conn);
        $this->accessRequestModel = new AccessRequest($conn);
    }

    public function login(array $data)
    {
        $email = trim((string) ($data["email"] ?? ""));
        $password = (string) ($data["password"] ?? "");

        if ($email === "" || $password === "") {
            throw new InvalidArgumentException("Email and password are required");
        }

        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            $request = $this->accessRequestModel->findByEmail($email);

            if ($request && $request["status"] === "pending") {
                throw new InvalidArgumentException("Your account is waiting for admin approval");
            }

            if ($request && $request["status"] === "declined") {
                throw new InvalidArgumentException("Your access request was declined by an admin");
            }

            throw new InvalidArgumentException("Invalid email or password");
        }

        if (!checkPassword($password, $user["password"] ?? "")) {
            throw new InvalidArgumentException("Invalid email or password");
        }

        $fullUser = $this->userModel->find((int) $user["id"]);

        if (!$fullUser) {
            throw new InvalidArgumentException("User account not found");
        }

        return $this->buildAuthPayload($fullUser);
    }

    public function register(array $data)
    {
        $name = trim((string) ($data["name"] ?? ""));
        $email = trim((string) ($data["email"] ?? ""));
        $password = (string) ($data["password"] ?? "");
        $accountType = strtolower(trim((string) ($data["account_type"] ?? "")));
        $staffCode = trim((string) ($data["staff_code"] ?? ""));
        $position = trim((string) ($data["position"] ?? ""));

        if ($name === "" || $email === "" || $password === "") {
            throw new InvalidArgumentException("Name, email, and password are required");
        }

        if (!in_array($accountType, ["admin", "staff"], true)) {
            throw new InvalidArgumentException("account_type must be admin or staff");
        }

        if ($this->userModel->findByEmail($email)) {
            throw new InvalidArgumentException("This email already has an approved account");
        }

        $existingRequest = $this->accessRequestModel->findByEmail($email);

        if ($existingRequest && $existingRequest["status"] === "pending") {
            throw new InvalidArgumentException("This email already has a pending approval request");
        }

        $role = $this->roleModel->findByName($accountType);

        if (!$role) {
            throw new InvalidArgumentException("Required role is missing. Please seed roles first.");
        }

        if ($accountType === "staff" && $staffCode === "") {
            throw new InvalidArgumentException("staff_code is required for staff signup");
        }

        if ($accountType === "staff" && $this->staffModel->findByStaffCode($staffCode)) {
            throw new InvalidArgumentException("Staff code already exists");
        }

        if ($existingRequest && $existingRequest["status"] === "declined") {
            $this->conn->prepare("DELETE FROM access_requests WHERE id = :id")->execute([
                ":id" => $existingRequest["id"],
            ]);
        }

        $request = $this->accessRequestModel->create([
            "name" => $name,
            "email" => $email,
            "password" => hashPassword($password),
            "account_type" => $accountType,
            "staff_code" => $accountType === "staff" ? $staffCode : null,
            "position" => $accountType === "staff" ? ($position !== "" ? $position : "Teacher") : null,
        ]);

        return [
            "request" => $this->formatAccessRequest($request),
        ];
    }

    public function getAccessRequests()
    {
        return array_map(fn($request) => $this->formatAccessRequest($request), $this->accessRequestModel->getAll());
    }

    public function reviewAccessRequest(array $data)
    {
        $id = $data["id"] ?? null;
        $action = strtolower(trim((string) ($data["action"] ?? "")));

        if (!is_numeric($id)) {
            throw new InvalidArgumentException("Valid request id is required");
        }

        if (!in_array($action, ["approve", "decline"], true)) {
            throw new InvalidArgumentException("action must be approve or decline");
        }

        $request = $this->accessRequestModel->find((int) $id);

        if (!$request) {
            throw new InvalidArgumentException("Access request not found");
        }

        if ($request["status"] !== "pending") {
            throw new InvalidArgumentException("This request has already been reviewed");
        }

        if ($action === "decline") {
            return $this->formatAccessRequest($this->accessRequestModel->updateStatus((int) $id, "declined"));
        }

        $role = $this->roleModel->findByName($request["account_type"]);

        if (!$role) {
            throw new InvalidArgumentException("Required role is missing. Please seed roles first.");
        }

        if ($this->userModel->findByEmail($request["email"])) {
            throw new InvalidArgumentException("An approved account already exists for this email");
        }

        if ($request["account_type"] === "staff" && $this->staffModel->findByStaffCode($request["staff_code"])) {
            throw new InvalidArgumentException("Staff code already exists");
        }

        $this->conn->beginTransaction();

        try {
            $user = $this->userModel->create([
                "name" => $request["name"],
                "email" => $request["email"],
                "password" => $request["password"],
                "role_id" => (int) $role["id"],
            ]);

            if ($request["account_type"] === "staff") {
                $this->staffModel->create([
                    "user_id" => (int) $user["id"],
                    "staff_code" => $request["staff_code"],
                    "position" => $request["position"] !== "" ? $request["position"] : "Teacher",
                ]);
            }

            $reviewed = $this->accessRequestModel->updateStatus((int) $id, "approved");
            $this->conn->commit();

            return $this->formatAccessRequest($reviewed);
        } catch (Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    private function buildAuthPayload(array $user)
    {
        $staffProfile = null;
        if (strtolower((string) ($user["role_name"] ?? "")) === "staff") {
            $staffProfile = $this->staffModel->findByUserId((int) $user["id"]);
        }

        $safeUser = [
            "id" => (int) $user["id"],
            "name" => $user["name"],
            "email" => $user["email"],
            "role_id" => (int) $user["role_id"],
            "role_name" => $user["role_name"] ?? "",
            "staff_id" => isset($staffProfile["id"]) ? (int) $staffProfile["id"] : null,
            "staff_code" => $staffProfile["staff_code"] ?? null,
            "position" => $staffProfile["position"] ?? null,
        ];

        return [
            "token" => createAccessToken($safeUser),
            "user" => $safeUser,
        ];
    }

    private function formatAccessRequest(array $request)
    {
        return [
            "id" => (int) $request["id"],
            "name" => $request["name"],
            "email" => $request["email"],
            "account_type" => $request["account_type"],
            "staff_code" => $request["staff_code"],
            "position" => $request["position"],
            "status" => $request["status"],
            "created_at" => $request["created_at"] ?? null,
            "reviewed_at" => $request["reviewed_at"] ?? null,
        ];
    }
}
