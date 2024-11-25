import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/autocomplete")
public class AjaxUtility extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String query = request.getParameter("query");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Gson gson = new Gson();
        
        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            String sql = "SELECT product_name FROM Products WHERE product_name LIKE ? LIMIT 10";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, "%" + query + "%");
            ResultSet rs = stmt.executeQuery();
            
            List<String> products = new ArrayList<>();
            while (rs.next()) {
                products.add(rs.getString("product_name"));
            }
            
            out.print(gson.toJson(products));
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
