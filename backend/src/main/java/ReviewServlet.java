import com.google.gson.Gson;
//import com.google.gson.JsonArray;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
//import com.google.gson.JsonObject;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@WebServlet("/review")
public class ReviewServlet extends HttpServlet {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/smartnest";
    private static final String USER = "root";
    private static final String PASS = "Localhost@80";

    private static final String MONGO_URI = "mongodb://localhost:27017/smartnest";
    private static MongoDatabase mongoDatabase;

    @Override
    public void init() throws ServletException {
        super.init();
        // Initialize MongoDB connection
        MongoClientURI uri = new MongoClientURI(MONGO_URI);
        MongoClient mongoClient = new MongoClient(uri);
        mongoDatabase = mongoClient.getDatabase("smartnest");
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Allow preflight requests
        setCorsHeaders(response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set CORS headers for GET requests
        setCorsHeaders(response);

        String action = request.getParameter("action");
        System.out.println("Received action: " + action); // Log the action

        if ("categories".equals(action)) {
            fetchCategories(response);
        } else if ("products".equals(action)) {
            String category = request.getParameter("categories");
            fetchProductsByCategory(category, response);
        } else if ("product-price".equals(action)) {
            String productName = request.getParameter("productName");
            fetchProductPrice(productName, response);
        } else if ("product-onsale".equals(action)) {
            String productName = request.getParameter("productName");
            fetchProductOnSale(productName, response); // Implement this method to fetch onsale
        } else if ("product-rebate".equals(action)) {
            String productName = request.getParameter("productName");
            fetchProductRebate(productName, response); // Implement this method to fetch rebate
        } else if ("storeid".equals(action)) {
            fetchStoreId(response); // Implement this method to fetch storeid
        } else if ("store-city".equals(action)) {
            String storeid = request.getParameter("storeid");
            fetchStoreCity(storeid, response); // Implement this method to fetch store city
        } else if ("store-state".equals(action)) {
            String storeid = request.getParameter("storeid");
            fetchStoreState(storeid, response); // Implement this method to fetch store state
        } else if ("store-zip".equals(action)) {
            String storeid = request.getParameter("storeid");
            fetchStoreZip(storeid, response); // Implement this method to fetch store-zip
        } else if ("store-name".equals(action)) {
            String storeid = request.getParameter("storeid");
            fetchStoreName(storeid, response); // Implement this method to fetch store name
        }
        
        else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid action parameter");
        }
    }

    private void fetchCategories(HttpServletResponse response) throws IOException {
        List<String> categories = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("SELECT DISTINCT category FROM Products")) {
            while (resultSet.next()) {
                categories.add(resultSet.getString("category"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching categories");
            return;
        }
    
        // Log the fetched categories to the server logs
        System.out.println("Fetched Categories: " + categories);
    
        // Create plain text response
        StringBuilder plainTextResponse = new StringBuilder();
        for (String category : categories) {
            plainTextResponse.append(category).append("\n");
        }
    
        // Send the plain text response
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(plainTextResponse.toString());
    }

    
    

    private void fetchProductsByCategory(String category, HttpServletResponse response) throws IOException {
        if (category == null || category.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Category parameter is required");
            return;
        }

        List<String> products = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT product_name FROM Products WHERE category = ?")) {
            preparedStatement.setString(1, category);
            ResultSet resultSet = preparedStatement.executeQuery();
            while (resultSet.next()) {
                products.add(resultSet.getString("product_name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching products");
            return;
        }

        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(products));
    }

    private void fetchProductPrice(String productName, HttpServletResponse response) throws IOException {
        if (productName == null || productName.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Product name parameter is required");
            return;
        }

        double price = 0.0;
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT price FROM Products WHERE product_name = ?")) {
            preparedStatement.setString(1, productName);
            ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                price = resultSet.getDouble("price");
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
                return;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching product price");
            return;
        }

        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(Collections.singletonMap("price", price)));
    }





    private void fetchProductOnSale(String productName, HttpServletResponse response) throws IOException {
        if (productName == null || productName.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Product name parameter is required");
            return;
        }
    
        String onsale; // Default value
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT onsale FROM Products WHERE product_name = ?")) {
            preparedStatement.setString(1, productName);
            ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                onsale = resultSet.getString("onsale");
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
                return;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching product on-sale status");
            return;
        }
    
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(Collections.singletonMap("onsale", onsale)));
    }




    private void fetchProductRebate(String productName, HttpServletResponse response) throws IOException {
        if (productName == null || productName.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Product name parameter is required");
            return;
        }
    
        String rebate; // Default value
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT rebate FROM Products WHERE product_name = ?")) {
            preparedStatement.setString(1, productName);
            ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                rebate = resultSet.getString("rebate");
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
                return;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching product rebate");
            return;
        }
    
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(Collections.singletonMap("rebate", rebate)));
    }
    
    private void fetchStoreId(HttpServletResponse response) throws IOException {
        List<String> storeid = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("SELECT DISTINCT store_id FROM StoreLocations")) {
            while (resultSet.next()) {
                storeid.add(resultSet.getString("store_id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching categories");
            return;
        }
    
        // Log the fetched categories to the server logs
        System.out.println("Fetched Store Id: " + storeid);
    
        // Create plain text response
        StringBuilder plainTextResponse = new StringBuilder();
        for (String fetchedstoreid : storeid) {
            plainTextResponse.append(fetchedstoreid).append("\n");
        }
    
        // Send the plain text response
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(plainTextResponse.toString());
    }

    private void fetchStoreCity(String storeid, HttpServletResponse response) throws IOException {
        if (storeid == null || storeid.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Store ID name parameter is required");
            return;
        }
    
        String city; // Default value
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT city FROM StoreLocations WHERE store_id = ?")) {
            preparedStatement.setString(1, storeid);
            ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                city = resultSet.getString("city");
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "City not found");
                return;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching story city");
            return;
        }
    
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(Collections.singletonMap("city", city)));
    }

    private void fetchStoreState(String storeid, HttpServletResponse response) throws IOException {
        if (storeid == null || storeid.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Product name parameter is required");
            return;
        }
    
        String state; // Default value
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT state FROM StoreLocations WHERE store_id = ?")) {
            preparedStatement.setString(1, storeid);
            ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                state = resultSet.getString("state");
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
                return;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching product rebate");
            return;
        }
    
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(Collections.singletonMap("state", state)));
    }

    private void fetchStoreZip(String storeid, HttpServletResponse response) throws IOException {
        if (storeid == null || storeid.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Product name parameter is required");
            return;
        }
    
        String zip; // Default value
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT zip_code FROM StoreLocations WHERE store_id = ?")) {
            preparedStatement.setString(1, storeid);
            ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                zip = resultSet.getString("zip_code");
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
                return;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching product rebate");
            return;
        }
    
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(Collections.singletonMap("zip", zip)));
    }

    private void fetchStoreName(String storeid, HttpServletResponse response) throws IOException {
        if (storeid == null || storeid.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Product name parameter is required");
            return;
        }
    
        String storename; // Default value
        try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
             PreparedStatement preparedStatement = connection.prepareStatement("SELECT store_name FROM StoreLocations WHERE store_id = ?")) {
            preparedStatement.setString(1, storeid);
            ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                storename = resultSet.getString("store_name");
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
                return;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error while fetching product rebate");
            return;
        }
    
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(Collections.singletonMap("storename", storename)));
    }


    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set CORS headers for POST requests
        setCorsHeaders(response);

        // Log incoming request parameters
        request.getParameterMap().forEach((key, value) -> 
            System.out.println(key + ": " + String.join(", ", value)));

        String userID = request.getParameter("userID");
        String userAge = request.getParameter("userAge");
        String userGender = request.getParameter("userGender");
        String userOccupation = request.getParameter("userOccupation");
        String reviewRating = request.getParameter("reviewRating");
        String reviewText = request.getParameter("reviewText");
        String reviewDate = request.getParameter("reviewDate");
        String productModelName = request.getParameter("productModelName");
        String productCategory = request.getParameter("productCategory");
        String productPrice = request.getParameter("productPrice");
        String productonsale = request.getParameter("productonsale");
        String productrebate = request.getParameter("productrebate");
        String manufacturerName = request.getParameter("manufacturerName");
        String storeId = request.getParameter("storeid");
        String storeZip = request.getParameter("zip");
        String storeState = request.getParameter("state");
        String storeCity = request.getParameter("city");
        String storeName = request.getParameter("storename");

        // Validate required parameters
        if (userID == null || productModelName == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "User ID and Product Model Name are required");
            return;
        }

        // Insert the review into MongoDB
        try {
            MongoCollection<Document> collection = mongoDatabase.getCollection("reviews");
            Document review = new Document("userID", userID)
                    .append("userAge", userAge)
                    .append("userGender", userGender)
                    .append("userOccupation", userOccupation)
                    .append("reviewRating", reviewRating)
                    .append("reviewText", reviewText)
                    .append("reviewDate", reviewDate)
                    .append("productModelName", productModelName)
                    .append("productCategory", productCategory)
                    .append("productPrice", productPrice)
                    .append("productonsale", productonsale)
                    .append("productrebate", productrebate)
                    .append("manufacturerName", manufacturerName)
                    .append("storeid", storeId)
                    .append("city", storeCity)
                    .append("state", storeState)
                    .append("zip", storeZip)
                    .append("storename", storeName);
            collection.insertOne(review);
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to save review");
        }
    }

    private void setCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}