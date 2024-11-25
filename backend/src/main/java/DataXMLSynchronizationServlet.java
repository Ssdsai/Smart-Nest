import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.w3c.dom.*;
import javax.xml.parsers.*;
import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;
import com.google.gson.Gson;

@WebServlet("/loadProducts")
public class DataXMLSynchronizationServlet extends HttpServlet {
    
    public HashMap<String, DataProductXMLSynchronization> productMap = new HashMap<>();

    @Override
    public void init() throws ServletException {
        super.init();
        loadProducts();
        storeProductsInDatabase();  // Store products in the MySQL database after loading
        getServletContext().setAttribute("DataXMLSynchronizationServlet", this);  // Register this servlet instance
        getServletContext().setAttribute("productMap", productMap);
        System.out.println("DataXMLSynchronizationServlet initialized.");

        // Log the number of products loaded
    System.out.println("Number of products loaded: " + productMap.size());
    System.out.println("Product IDs in map: " + productMap.keySet());
    }

    private void loadProducts() {
        try {
            File inputFile = new File("D:/hw1/smart-nest/backend/target/backend/WEB-INF/ProductCatalog.xml");
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(inputFile);
            doc.getDocumentElement().normalize();
            
            // Load multiple product types
            loadProductType(doc, "thermostat");
            loadProductType(doc, "speaker");
            loadProductType(doc, "light");
            loadProductType(doc, "doorlock");
            loadProductType(doc, "doorbell");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadProductType(Document doc, String productType) {
        NodeList productList = doc.getElementsByTagName(productType);
        for (int i = 0; i < productList.getLength(); i++) {
            Node node = productList.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                Element element = (Element) node;

                // Extract product information
                String id = getTextContentSafely(element, "id");
                String name = getTextContentSafely(element, "name");
                String category = getTextContentSafely(element, "category");
                String image = getTextContentSafely(element, "image");
                double discount = parseDoubleOrDefault(element.getElementsByTagName("discount").item(0).getTextContent(), 0);
                double oprice = parseDoubleOrDefault(getTextContentSafely(element, "oprice"), 0);
                double discount_display = parseDoubleOrDefault(getTextContentSafely(element, "discount_display"), 0);
                double Discount = parseDoubleOrDefault(getTextContentSafely(element, "Discount"), 0);
                double manufactureRebate = parseDoubleOrDefault(getTextContentSafely(element, "manufactureRebate"), 0);
                String description = getTextContentSafely(element, "description");
                String product_id = getTextContentSafely(element, "product_id");
                String onsale = getTextContentSafely(element, "onsale"); // Get onsale status

                // Store accessories in a HashMap
                NodeList accessoryList = element.getElementsByTagName("accessory");
                Map<String, Double> accessories = new HashMap<>();
                for (int j = 0; j < accessoryList.getLength(); j++) {
                    Element accessory = (Element) accessoryList.item(j);
                    String accessoryName = getTextContentSafely(accessory, "name");
                    double accessoryPrice = parseDoubleOrDefault(getTextContentSafely(accessory, "price"), 0);
                    accessories.put(accessoryName, accessoryPrice);
                }
                
                // Create Product object and store it in the map
                DataProductXMLSynchronization product = new DataProductXMLSynchronization(id, product_id, name, category, image, oprice, discount, Discount, discount_display, manufactureRebate, description, accessories, onsale);
                productMap.put(product_id, product);
            }
        }
    }

    private void storeProductsInDatabase() {
    Connection conn = null;
    PreparedStatement ps = null;

    try {
        conn = MySQLDataStoreUtilities.getConnection();
        if (conn != null) {
            String insertProductQuery = "INSERT INTO Products (product_id, product_name, category, price, discount, product_sales, onsale, rebate, description) "
                    + "VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?) "
                    + "ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), category = VALUES(category), price = VALUES(price), discount = VALUES(discount), rebate = VALUES(rebate), onsale = VALUES(onsale), description = VALUES(description)";

            ps = conn.prepareStatement(insertProductQuery);

            for (DataProductXMLSynchronization product : productMap.values()) {
                try {
                    ps.setString(1, product.getProductId());
                    ps.setString(2, product.getName());
                    ps.setString(3, product.getCategory());
                    ps.setDouble(4, product.getOprice());
                    ps.setDouble(5, product.getDiscount());

                    String onsaleValue = product.getOnsale();
                    if (onsaleValue == null || onsaleValue.isEmpty()) {
                        onsaleValue = "no";
                    }
                    ps.setString(6, onsaleValue);



                    ps.setString(6, onsaleValue); // Corrected duplicate parameter index issue
                    ps.setDouble(7, product.getManufactureRebate());
                    ps.setString(8, product.getDescription());


                    ps.executeUpdate();
                } catch (SQLException e) {
                    System.err.println("Error inserting product: " + product.getName());
                    e.printStackTrace();
                }
            }
            System.out.println("Products have been successfully inserted/updated in the database.");
        }
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        // Close resources
        try { if (ps != null) ps.close(); } catch (Exception e) { e.printStackTrace(); }
        MySQLDataStoreUtilities.closeConnection(conn);
    }
}
    public HashMap<String, DataProductXMLSynchronization> getProductMap() {
        return (HashMap<String, DataProductXMLSynchronization>) getServletContext().getAttribute("productMap");
        //return productMap; // Expose the productMap
    }

    private String getTextContentSafely(Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            Node node = nodeList.item(0);
            return node.getTextContent();
        }
        return ""; // Return empty string if the tag is not found
    }

    private double parseDoubleOrDefault(String value, double defaultValue) {
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        return Double.parseDouble(value);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set response content type to JSON
        response.setContentType("application/json");
        
        // Create Gson instance to convert the product map to JSON
        Gson gson = new Gson();
        
        // Convert the HashMap to JSON and write it to the response
        String jsonOutput = gson.toJson(productMap);
        response.getWriter().write(jsonOutput);
    }
}
