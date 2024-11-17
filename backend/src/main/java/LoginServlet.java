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

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

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

        String email = request.getParameter("email");
        String password = request.getParameter("password");

        System.out.println("Email: " + email);
        System.out.println("Password: [hidden]");

        String jsonResponse;

        String userId = validateUser(email, password);
        if (userId != null) {
            jsonResponse = String.format("{\"status\":\"success\",\"message\":\"Login successful!\",\"user_id\":\"%s\"}", userId);
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            jsonResponse = "{\"status\":\"error\",\"message\":\"Invalid email or password!\"}";
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }

        out.print(jsonResponse);
        out.flush();
    }

    private String validateUser(String email, String password) {
        String query = "SELECT user_id FROM UserDetails WHERE email = ? AND password = ?"; // Assuming user_id is a column in UserDetails
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, email);
            ps.setString(2, password); // Note: You should hash the password before checking it in a real application

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getString("user_id"); // Return the user_id if found
            } else {
                return null; // No matching record found
            }
        } catch (SQLException e) {
            System.err.println("SQL Exception during user validation: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private void setCORSHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Accept, Authorization, Content-Type");
        response.setHeader("Access-Control-Max-Age", "3600");
    }
}
