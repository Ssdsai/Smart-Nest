import com.google.gson.Gson;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/trending")
public class TrendingServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set CORS headers to allow requests from the frontend
        setCorsHeaders(response);

        String action = request.getParameter("action");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if ("top-products".equals(action)) {
            out.println(getTopProducts());
        } else if ("top-zipcodes".equals(action)) {
            out.println(getTopZipCodes());
        } else if ("most-sold-products".equals(action)) {
            out.println(getMostSoldProducts());
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set CORS headers for preflight requests
        setCorsHeaders(response);
        response.setStatus(HttpServletResponse.SC_OK);  // Return OK status for OPTIONS preflight
    }

    // Helper method to set the CORS headers
    private void setCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    private String getTopProducts() {
        List<ProductReview> topProducts = new ArrayList<>();
        try {
            MongoDatabase database = MongoDBDataStoreUtilities.getDatabase();
            MongoCollection<Document> collection = database.getCollection("reviews");

            // Sort reviewRating in descending order and limit to 5
            for (Document doc : collection.find().sort(new Document("reviewRating", -1)).limit(5)) {
                String productModelName = doc.getString("productModelName");
                String productPrice = doc.getString("productPrice");
                String reviewRating = doc.getString("reviewRating");

                ProductReview review = new ProductReview(productModelName, productPrice, reviewRating);
                topProducts.add(review);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new Gson().toJson(topProducts); // Always return a valid JSON response
    }

    private String getTopZipCodes() {
        List<ZipCodeSales> zipCodes = new ArrayList<>();
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                "SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(customer_address, ',', -1), ' ', -1) AS StoreZip, " +
                "SUM(total_sales) AS totalSales " +  // Sum total_sales for each zip code
                "FROM Orders " +
                "WHERE customer_address REGEXP '[0-9]{5}' " +  // Ensure valid zip code format
                "GROUP BY StoreZip " +  // Group by zip code
                "ORDER BY totalSales DESC " +  // Order by totalSales in descending order
                "LIMIT 5");  // Get the top 5 zip codes
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                String zipCode = rs.getString("StoreZip");
                int totalSales = rs.getInt("totalSales"); 
                zipCodes.add(new ZipCodeSales(zipCode, totalSales));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new Gson().toJson(zipCodes);  // Return valid JSON response
    }

    private String getMostSoldProducts() {
        List<ProductSales> mostSoldProducts = new ArrayList<>();
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                "SELECT p.product_name, SUM(o.total_sales) AS total_sales " +
                "FROM Orders o " +
                "JOIN Products p ON o.product_id = p.product_id " + // Join with Products table
                "GROUP BY p.product_name " +  // Group by product name to sum total sales per product
                "ORDER BY total_sales DESC " +  // Order by total sales in descending order
                "LIMIT 5");  // Limit to top 5 products
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                String productName = rs.getString("product_name");
                int totalSales = rs.getInt("total_sales");
                mostSoldProducts.add(new ProductSales(productName, totalSales));  // Add totalSales
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new Gson().toJson(mostSoldProducts); // Return the most sold products with total sales
    }

    // Helper classes for ProductReview, ZipCodeSales, and ProductSales
    private class ProductReview {
        String productModelName;
        String productPrice;
        String reviewRating;

        public ProductReview(String productModelName, String productPrice, String reviewRating) {
            this.productModelName = productModelName;
            this.productPrice = productPrice;
            this.reviewRating = reviewRating;
        }
    }

    private class ZipCodeSales {
        String zipCode;
        int totalSales;

        public ZipCodeSales(String zipCode, int totalSales) {
            this.zipCode = zipCode;
            this.totalSales = totalSales;
        }

        public String getZipCode() {
            return zipCode;
        }

        public int getTotalSales() {
            return totalSales;
        }
    }

    private class ProductSales {
        String productName;
        int totalSales;

        public ProductSales(String productName,int totalSales) {
            this.productName = productName;
            this.totalSales = totalSales;
        }
    }
}
