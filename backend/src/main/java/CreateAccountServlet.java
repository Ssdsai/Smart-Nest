import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/create-account")
public class CreateAccountServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setCORSHeaders(response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setCORSHeaders(response);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String userId = request.getParameter("user_id");
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        System.out.println("User ID: " + userId);  
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Password: [hidden]");

        String jsonResponse;

        if (checkIfAccountExists(email)) {
            jsonResponse = "{\"status\":\"error\",\"message\":\"Account already exists with this email!\"}";
            response.setStatus(HttpServletResponse.SC_CONFLICT);
        } else {
            if (createAccount(userId, name, email, password)) {
                jsonResponse = "{\"status\":\"success\",\"message\":\"Account created successfully!\",\"redirect\":\"/login\"}";
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                jsonResponse = "{\"status\":\"error\",\"message\":\"An error occurred during account creation.\"}";
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        }

        out.print(jsonResponse);
        out.flush();
    }

    private boolean checkIfAccountExists(String email) {
        String query = "SELECT COUNT(*) FROM UserDetails WHERE email = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            System.out.println("Checking if account exists for email: " + email);
            return rs.next() && rs.getInt(1) > 0;
        } catch (SQLException e) {
            System.err.println("SQL Exception while checking account existence: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private boolean createAccount(String userId, String name, String email, String password) {
        String query = "INSERT INTO UserDetails (user_id, name, email, password) VALUES (?, ?, ?, ?)";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, userId);
            ps.setString(2, name);
            ps.setString(3, email);
            ps.setString(4, password);  // You can hash the password here before saving it

            System.out.println("Inserting user into the SmartNest database.");
            int result = ps.executeUpdate();

            return result > 0;  // Returns true if one row was successfully inserted
        } catch (SQLException e) {
            System.err.println("SQL Exception during account creation: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private void setCORSHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Accept, Authorization, Content-Type");
        response.setHeader("Access-Control-Max-Age", "3600");
    }
}
