import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/checkout")
public class SaveOrderServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        // Parse incoming JSON data
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = request.getReader().readLine()) != null) {
            sb.append(line);
        }
        
        JSONObject json = new JSONObject(sb.toString());
        
        // Extract data from JSON
        String user_id = json.optString("user_id");
        String customer_name = json.optString("customer_name");
        String customer_address = json.optString("customer_address");
        String credit_card_number = json.optString("credit_card_number");
        String order_id = json.optString("order_id");
        String purchase_date = json.optString("purchase_date");
        String ship_date = json.optString("ship_date");
        double shipping_cost = json.optDouble("shipping_cost", 0.0);
        String store_id = json.optString("store_id");
        String store_address = json.optString("store_address");
        JSONArray cart_items = json.optJSONArray("cart_items");

        // Validate input
        if (user_id.isEmpty() || customer_name.isEmpty() || cart_items == null || cart_items.length() == 0) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing required fields.");
            return;
        }

        // Initialize total sales based on the total quantity of all items
        //double total_sales = 0.0;

        // Database operation
        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            if (conn == null) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to connect to the database.");
                return;
            }

            String insertOrder = "INSERT INTO Orders (order_id, user_id, customer_name, customer_address, credit_card_number,  purchase_date, ship_date, product_id, category, quantity, price, shipping_cost, discount, total_sales, store_id, store_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            

            /*// Calculate total sales by summing up the quantities of all items
            for (int i = 0; i < cart_items.length(); i++) {
                JSONObject item = cart_items.getJSONObject(i);
                int quantity = item.getInt("quantity");  // Get item quantity
                total_sales += quantity;  // Add item quantity to total sales
            }*/

            // Insert each cart item
            for (int i = 0; i < cart_items.length(); i++) {
                JSONObject item = cart_items.getJSONObject(i);
                String product_id = item.getString("product_id");
                String category = item.getString("category");
                int quantity = item.getInt("quantity");
                double price = item.getDouble("price");
                double discount = item.optDouble("discount", 0.0); // Default to 0 if discount is not present
                int total_sales = quantity;

                try (PreparedStatement pstmt = conn.prepareStatement(insertOrder)) {
                    pstmt.setString(1, order_id);
                    pstmt.setString(2, user_id);
                    pstmt.setString(3, customer_name);
                    pstmt.setString(4, customer_address);
                    pstmt.setString(5, credit_card_number);
                    pstmt.setString(6, purchase_date);
                    pstmt.setString(7, ship_date);
                    pstmt.setString(8, product_id);
                    pstmt.setString(9, category);
                    pstmt.setInt(10, quantity);
                    pstmt.setDouble(11, price);
                    pstmt.setDouble(12, shipping_cost);
                    pstmt.setDouble(13, discount);
                    pstmt.setDouble(14, total_sales);
                    pstmt.setString(15, store_id);
                    pstmt.setString(16, store_address);

                    pstmt.executeUpdate();
                }
            }

            // Return success response
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{\"status\": \"success\"}");
        } catch (SQLException e) {
            e.printStackTrace(); // Log the error for debugging
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to save order: " + e.getMessage());
        } finally {
            out.flush();
        }
    }
}
