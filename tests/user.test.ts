import axios from "axios";

const BASE_URL = "";

let ACCESS_TOKEN = "";
let REFRESH_TOKEN = "";
let USER_ID = "";
let ROLE_ID = "";

// Helper function to handle API calls
const apiCall = async (method: string, endpoint: string, data?: any) => {
  const config = {
    method,
    url: `${BASE_URL}/${endpoint}`,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data,
  };
  return await axios(config);
};

describe("User API Tests", () => {
  test("User Login", async () => {
    const response = await apiCall("POST", "login", {
      email: "superadmin@pnacademy.in",
      password: "Test@pna12345",
      deviceType: "web",
    });

    ACCESS_TOKEN = response.data.accessToken;
    REFRESH_TOKEN = response.data.refreshToken;

    expect(ACCESS_TOKEN).toBeDefined();
    expect(REFRESH_TOKEN).toBeDefined();
  });

  test("User Login - Invalid Credentials", async () => {
    await expect(
      apiCall("POST", "login", {
        email: "wrong@email.com",
        password: "wrongpassword",
        deviceType: "web",
      })
    ).rejects.toThrow();
  });

  test("User Login - Missing Fields", async () => {
    await expect(
      apiCall("POST", "login", {
        email: "superadmin@pnacademy.in",
      })
    ).rejects.toThrow();
  });

  test("Get User Info", async () => {
    const response = await apiCall("GET", "info");

    expect(response.data).toHaveProperty("message");
    expect(response.data.message).toBe("success");
  });

  test("Create user", async () => {
    {
      const mockUserdata = {
        firstName: "test",
        lastName: "admin",
        email: "",
        password: "",
        phone: "9876543211",
      };
      const response = await apiCall("POST", "register", mockUserdata);

      expect(response.data).toHaveProperty("message");
      expect(response.data.message).toBe("User registered successfully");
      expect(response.data).toHaveProperty("data");
      const userResponseData = response.data.data;
      expect(userResponseData).toHaveProperty("id");
      USER_ID = userResponseData.id;
    }
  });

  test("Create User - Missing Required Fields", async () => {
    const incompleteUserData = {
      firstName: "test",
      lastName: "admin",
    };
    await expect(
      apiCall("POST", "register", incompleteUserData)
    ).rejects.toThrow();
  });
  test("Create User - Weak Password", async () => {
    const weakPasswordUser = {
      firstName: "test",
      lastName: "user",
      email: "test@example.com",
      password: "weak",
      phone: "1234567890",
    };
    await expect(
      apiCall("POST", "register", weakPasswordUser)
    ).rejects.toThrow();
  });

  test("Create Role", async () => {
    const roleData = {
      name: "test-admin",
      permissions: {
        canManageAssessment: true,
        canManageUser: true,
        canManageRole: true,
        canManageNotification: true,
        canManageLocalGroup: true,
        canManageReports: true,
        canAttemptAssessment: true,
        canViewReport: true,
        canManageMyAccount: true,
        canViewNotification: true,
      },
    };

    const response = await apiCall("POST", "role", roleData);
    expect(response.data.message).toBe("Role Created successfully");

    expect(response.data).toHaveProperty("data");
    const roleResponseData = response.data.data;
    expect(roleResponseData.id).toBeDefined();
    ROLE_ID = roleResponseData.id;
  });
  test("Create Role - Invalid Permissions", async () => {
    const roleData = {
      name: "invalid-role",
      permissions: {
        invalidPermission: true,
      },
    };
    await expect(apiCall("POST", "role", roleData)).rejects.toThrow();
  });
  test("Update User", async () => {
    const updateData = {
      id: USER_ID,
      dataToUpdate: {
        firstName: "super",
        lastName: "user",
        email: "admin@admin.com",
        phone: "9090909090",
        roleId: ROLE_ID,
      },
    };

    const response = await apiCall("PATCH", "update", updateData);
    expect(response.data.message).toBe("User Updated successfully");
  });
  test("Update User - Non-existent User", async () => {
    const updateData = {
      id: "non_existent_id",
      dataToUpdate: {
        firstName: "John",
        lastName: "Doe",
      },
    };
    await expect(apiCall("PATCH", "update", updateData)).rejects.toThrow();
  });
  test("Get Bulk Users", async () => {
    const response = await apiCall("GET", "bulk?page=1&pageSize=10");
    expect(response.data).toHaveProperty("message");
    expect(response.data.message).toBe("success");
  });

  test("Get Roles", async () => {
    const response = await apiCall("GET", "roles?page=1&pageSize=10");
    expect(response.data).toHaveProperty("message");
    expect(response.data.message).toBe("success");
  });

  test("Delete Role", async () => {
    const response = await apiCall("DELETE", "role", {
      roleIds: [{ roleId: ROLE_ID }],
    });
    expect(response.data.message).toBe("Roles Deleted successfully");
  });
  test("Delete Role - Non-existent Role", async () => {
    await expect(
      apiCall("DELETE", "role", {
        roleIds: [{ roleId: "non_existent_role_id" }],
      })
    ).rejects.toThrow();
  });

  test("New Access Token", async () => {
    const response = await apiCall("POST", "access-token", {
      refreshToken: REFRESH_TOKEN,
    });
    expect(response.data.message).toBe("New Access Token granted successfully");
  });

  test("Export Users", async () => {
    const response = await apiCall("GET", "export");
    expect(response.data).toContain(
      "id,first_name,last_name,email,phone,createdAt,updatedAt"
    );
  });

  test("Delete Users", async () => {
    const response = await apiCall("DELETE", "delete", { userIds: [USER_ID] });
    expect(response.data.message).toBe("Users Deleted successfully");
  });
  test("Delete Users - Non-existent User", async () => {
    await expect(
      apiCall("DELETE", "delete", { userIds: ["non_existent_user_id"] })
    ).rejects.toThrow();
  });
});
