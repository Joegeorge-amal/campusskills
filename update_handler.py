import os

with open('backend/src/main/java/com/campusskills/modules/admin/handlers/AdminManagementHandler.java', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add UserProfileRepository import
import_statement = "import com.campusskills.modules.users.repositories.UserProfileRepository;\nimport io.vertx.core.Future;\nimport java.util.ArrayList;\nimport java.util.List;\n"
content = content.replace('import com.campusskills.modules.users.repositories.UserRepository;', 'import com.campusskills.modules.users.repositories.UserRepository;\n' + import_statement)

# 2. Add field to class
field = "private final UserProfileRepository userProfileRepository;\n"
content = content.replace('private final EmailService emailService;', 'private final EmailService emailService;\n    ' + field)

# 3. Update constructor
constructor_old = 'public AdminManagementHandler(UserRepository userRepository, AuditLogService auditLogService, AdminInvitationRepository invitationRepository, EmailService emailService) {'
constructor_new = 'public AdminManagementHandler(UserRepository userRepository, AuditLogService auditLogService, AdminInvitationRepository invitationRepository, EmailService emailService, UserProfileRepository userProfileRepository) {'
content = content.replace(constructor_old, constructor_new)
content = content.replace('this.emailService = emailService;', 'this.emailService = emailService;\n        this.userProfileRepository = userProfileRepository;')

# 4. Update getStaff
get_staff_old = """    public void getStaff(RoutingContext ctx) {
        userRepository.findUsersByRoles(Arrays.asList(UserRole.ADMIN.name(), UserRole.SUPER_ADMIN.name()))
            .onSuccess(users -> {
                JsonArray arr = new JsonArray();
                for (User u : users) {
                    JsonObject json = JsonObject.mapFrom(u);
                    json.remove("passwordHash");
                    json.put("isBootstrap", UserService.isSuperAdmin(u.getEmail()));
                    arr.add(json);
                }
                ApiResponse.ok(ctx, arr);
            })
            .onFailure(err -> {
                ApiResponse.internalError(ctx, "Failed to load staff");
            });
    }"""

get_staff_new = """    public void getStaff(RoutingContext ctx) {
        userRepository.findUsersByRoles(Arrays.asList(UserRole.ADMIN.name(), UserRole.SUPER_ADMIN.name()))
            .onSuccess(users -> {
                JsonArray arr = new JsonArray();
                List<Future> futures = new ArrayList<>();
                for (User u : users) {
                    JsonObject json = JsonObject.mapFrom(u);
                    json.remove("passwordHash");
                    json.put("isBootstrap", UserService.isSuperAdmin(u.getEmail()));
                    
                    Future<Void> fut = userProfileRepository.findByUserId(u.getId()).map(profile -> {
                        if (profile != null) {
                            json.put("firstName", profile.getName());
                            json.put("name", profile.getName());
                        }
                        arr.add(json);
                        return null;
                    });
                    futures.add(fut);
                }
                io.vertx.core.CompositeFuture.all(futures).onComplete(res -> {
                    ApiResponse.ok(ctx, arr);
                });
            })
            .onFailure(err -> {
                ApiResponse.internalError(ctx, "Failed to load staff");
            });
    }"""
content = content.replace(get_staff_old, get_staff_new)

with open('backend/src/main/java/com/campusskills/modules/admin/handlers/AdminManagementHandler.java', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminManagementHandler.java")
