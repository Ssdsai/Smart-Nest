import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import com.google.gson.Gson;
import java.util.HashMap;

@WebServlet("/updateProductPrice")
public class ManagerUpdateProductPriceServlet extends HttpServlet {

    @Override
protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    // Set response content type to JSON
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    // Read JSON data from the request body
    StringBuilder sb = new StringBuilder();
    String line;
    try (BufferedReader reader = request.getReader()) {
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
    }

    // Parse JSON data
    Gson gson = new Gson();
    UpdateRequest updateRequest = gson.fromJson(sb.toString(), UpdateRequest.class);
    System.out.println("Parsed Product ID: " + updateRequest.product_id);
    System.out.println("Parsed New Price: " + updateRequest.newPrice);

    // Access the product map from the DataXMLSynchronizationServlet
    HashMap<String, DataProductXMLSynchronization> productMap = 
        (HashMap<String, DataProductXMLSynchronization>) getServletContext().getAttribute("productMap");
    
    // Add logging to check if productMap is available
    if (productMap != null) {
        System.out.println("Product map retrieved successfully.");
        System.out.println("Available product IDs: " + productMap.keySet());
    } else {
        System.out.println("Product map is not available.");
    }

    // Use the actual product_id from the JSON structure
    String actualProductId = updateRequest.product_id; // Fixed line
    DataProductXMLSynchronization product = productMap.get(actualProductId);
    if (product != null) {
        // Update the product price in the HashMap
        product.oprice = updateRequest.newPrice; // Update the object

        // Now update the database
        boolean isUpdated = updateProductPriceInDatabase(actualProductId, updateRequest.newPrice);
        if (isUpdated) {
            response.getWriter().write(gson.toJson(new ResponseMessage("Product price updated successfully.")));
        } else {
            response.getWriter().write(gson.toJson(new ResponseMessage("Failed to update product price in database.")));
        }
    } else {
        response.getWriter().write(gson.toJson(new ResponseMessage("Product not found.")));
    }
}



    private boolean updateProductPriceInDatabase(String productId, double newPrice) {
        boolean updated = false;
        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            // Start a transaction
            conn.setAutoCommit(false); // Disable auto-commit mode
            String updateQuery = "UPDATE Products SET price = ? WHERE product_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(updateQuery)) {
                ps.setDouble(1, newPrice);
                ps.setString(2, productId);
                int rowsAffected = ps.executeUpdate();
                
                // Check if the update was successful
                if (rowsAffected > 0) {
                    conn.commit(); // Commit the transaction
                    updated = true; // Update was successful
                } else {
                    conn.rollback(); // Rollback if no rows were updated
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return updated; // Return whether the update was successful
    }

    // UpdateRequest class adjusted to match your expected JSON structure
    private class UpdateRequest {
        String product_id; // This should match the product ID in your JSON
        double newPrice;

        // Constructor is needed for Gson
        public UpdateRequest() {}
    }

    private class ResponseMessage {
        String message;

        ResponseMessage(String message) {
            this.message = message;
        }
    }
}






/*import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/updateProductPrice")
public class ManagerUpdateProductPriceServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set response content type
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Get JSON data from request body
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = request.getReader().readLine()) != null) {
            sb.append(line);
        }

        // Parse JSON data
        Gson gson = new Gson();
        UpdateRequest updateRequest = gson.fromJson(sb.toString(), UpdateRequest.class);

        // Update price in the database
        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            String sql = "UPDATE Products SET price = ? WHERE product_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setDouble(1, updateRequest.newPrice);
                stmt.setString(2, updateRequest.productId);
                int rowsUpdated = stmt.executeUpdate();
                
                if (rowsUpdated > 0) {
                    response.getWriter().write(gson.toJson(new ResponseMessage("Product price updated successfully.")));
                } else {
                    response.getWriter().write(gson.toJson(new ResponseMessage("Product not found.")));
                }
            }
        } catch (SQLException e) {
            response.getWriter().write(gson.toJson(new ResponseMessage("Error updating product price: " + e.getMessage())));
            e.printStackTrace();
        }
    }

    private class UpdateRequest {
        String productId;
        double newPrice;
    }

    private class ResponseMessage {
        String message;

        ResponseMessage(String message) {
            this.message = message;
        }
    }
}*/
