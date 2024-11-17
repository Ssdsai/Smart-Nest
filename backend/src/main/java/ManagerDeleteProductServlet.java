import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonObject; // Use Gson's JsonObject
import com.google.gson.JsonParser;



@WebServlet("/deleteProduct")
public class ManagerDeleteProductServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Assuming this is your in-memory HashMap for products
    private static HashMap<String, DataProductXMLSynchronization> productMap = new HashMap<>();

    @Override
    public void init() throws ServletException {
        super.init();
        // Retrieve the productMap from the servlet context
        productMap = (HashMap<String, DataProductXMLSynchronization>) getServletContext().getAttribute("productMap");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        StringBuilder sb = new StringBuilder();

        // Read the JSON request body
        StringBuilder jsonBuilder = new StringBuilder();
        String line;
        while ((line = request.getReader().readLine()) != null) {
            jsonBuilder.append(line);
        }

        // Parse JSON to get productId
        String jsonString = jsonBuilder.toString();
        JsonObject jsonObject = JsonParser.parseString(jsonString).getAsJsonObject();
        String productId = jsonObject.get("productId").getAsString();

        // Check if the product exists in memory
        if (productMap.containsKey(productId)) {
            productMap.remove(productId); // Remove from in-memory HashMap
        } else {
            sb.append("{\"message\":\"Product not found in memory.\"}");
            out.print(sb.toString());
            out.flush();
            return; // Stop further execution
        }

        // Now delete the product from the database
        boolean isDeleted = deleteProduct(productId); // Call the delete method

        if (isDeleted) {
            sb.append("{\"message\":\"Product deleted successfully.\"}");
        } else {
            sb.append("{\"message\":\"Product deletion failed. Product not found in database.\"}");
        }

        out.print(sb.toString());
        out.flush();
    }

    // Method to delete product from the database
    private boolean deleteProduct(String productId) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = MySQLDataStoreUtilities.getConnection(); // Get database connection
            String deleteQuery = "DELETE FROM Products WHERE product_id = ?"; // Adjust the table and column names as necessary
            ps = conn.prepareStatement(deleteQuery);
            ps.setString(1, productId);
            int affectedRows = ps.executeUpdate();
            return affectedRows > 0; // Return true if product was deleted
        } catch (SQLException e) {
            e.printStackTrace();
            return false; // Return false if an error occurs
        } finally {
            // Close resources
            try { if (ps != null) ps.close(); } catch (Exception e) { e.printStackTrace(); }
            MySQLDataStoreUtilities.closeConnection(conn); // Close the connection
        }
    }
}
