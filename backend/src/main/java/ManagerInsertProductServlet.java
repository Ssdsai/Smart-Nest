import java.io.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import org.w3c.dom.*;
import com.google.gson.Gson;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.util.UUID;

@WebServlet("/manageProduct")
public class ManagerInsertProductServlet extends HttpServlet {

    private String generateId(String category) {
        if (category == null || category.isEmpty()) {
            throw new IllegalArgumentException("Category cannot be null or empty.");
        }
        return category.substring(0, 1).toUpperCase() + UUID.randomUUID().toString();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow requests from your frontend
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS"); // Allow POST and OPTIONS methods
        response.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow Content-Type header



        System.out.println("Servlet accessed");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }

        System.out.println("Request Payload: " + sb.toString());

        Gson gson = new Gson();
        ManagerXMLProductData productData = gson.fromJson(sb.toString(), ManagerXMLProductData.class);
        ManagerXMLAccessory[] accessories = productData.getAccessories();

        String category = sanitizeInput(productData.getCategory());
        String productName = sanitizeInput(productData.getProductName());
        String imageLink = sanitizeInput(productData.getImageLink());
        String description = sanitizeInput(productData.getDescription());
        String onSale = sanitizeInput(productData.isOnSale() ? "yes" : "no");
        System.out.println("Product Name: " + productName + ", onSale: " + onSale);


        double price = productData.getPrice();
        System.out.println("Parsing price: " + price);
        double parsedPrice = parseDoubleOrDefault(String.valueOf(price), 0);
        

        double discountDisplay = productData.getDiscount_display();
        System.out.println("Parsing discount_display: " + discountDisplay);
        double parsedDiscountDisplay = parseDoubleOrDefault(String.valueOf(discountDisplay), 0);

        double manufactureRebate = productData.getRebate();
        System.out.println("Parsing manufactureRebate: " + manufactureRebate);
        double parsedManufactureRebate = parseDoubleOrDefault(String.valueOf(manufactureRebate), 0);

        System.out.println("Category: " + category);
        System.out.println("Product Name: " + productName);
        System.out.println("Image Link: " + imageLink);
        System.out.println("Price: " + parsedPrice);
        System.out.println("Description: " + description);

        // Validation
        if (category.isEmpty() || productName.isEmpty() || imageLink.isEmpty() || parsedPrice <= 0 || description.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"message\":\"All fields must be filled out and price must be positive.\"}");
            return;
        }

        if (accessories == null || accessories.length == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"message\":\"No accessories provided.\"}");
            return;
        }

        for (ManagerXMLAccessory accessory : accessories) {
            if (accessory.getName() == null || accessory.getName().isEmpty() || accessory.getPrice() <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"message\":\"Invalid accessory data provided.\"}");
                return;
            }
            System.out.println("Accessory Name: " + accessory.getName());
            System.out.println("Accessory Price: " + accessory.getPrice());
        }

        String xmlFilePath = "D:/hw1/smart-nest/backend/src/main/webapp/WEB-INF/ProductCatalog.xml";

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new File(xmlFilePath));

            // Remove the trailing "s" from the category (if it exists)
            String singularCategory = category.endsWith("s") ? category.substring(0, category.length() - 1) : category;
            Element newProduct = doc.createElement(singularCategory);

            String formattedPrice = String.format("%.2f", parsedPrice);
            String formattedDiscountDisplay = String.format("%.2f", parsedDiscountDisplay);
            String formattedManufactureRebate = String.format("%.2f", parsedManufactureRebate);

            // New calculation for Discount and discount
            double totalDiscount = parsedDiscountDisplay + parsedManufactureRebate; // Sum of discount_display and manufactureRebate
            String formattedTotalDiscount = String.format("%.2f", totalDiscount);
            double calculatedDiscount = totalDiscount / 100; // Calculate discount as Discount / 100

            // Debugging Outputs
            System.out.println("Discount Display: " + formattedDiscountDisplay);
            System.out.println("Manufacture Rebate: " + formattedManufactureRebate);

            // Debugging Outputs
            System.out.println("Total Discount: " + formattedTotalDiscount);
            System.out.println("Calculated Discount: " + calculatedDiscount);

            newProduct.appendChild(createElementWithText(doc, "id", generateId(category)));
            newProduct.appendChild(createElementWithText(doc, "product_id", generateProductId(category)));
            newProduct.appendChild(createElementWithText(doc, "name", productName));
            newProduct.appendChild(createElementWithText(doc, "image", imageLink));
            // When adding elements to the XML, use the formatted strings:
            newProduct.appendChild(createElementWithText(doc, "oprice", formattedPrice)); // Price
            newProduct.appendChild(createElementWithText(doc, "discount", String.valueOf(calculatedDiscount))); // Set default discount
            newProduct.appendChild(createElementWithText(doc, "Discount", formattedTotalDiscount));
            newProduct.appendChild(createElementWithText(doc, "discount_display", formattedDiscountDisplay));
            newProduct.appendChild(createElementWithText(doc, "manufactureRebate", formattedManufactureRebate));
            newProduct.appendChild(createElementWithText(doc, "onSale", onSale)); // Updated field
            newProduct.appendChild(createElementWithText(doc, "description", description));

            if (accessories != null && accessories.length > 0) {
                Element accessoriesElement = doc.createElement("accessories");
                for (ManagerXMLAccessory accessory : accessories) {
                    Element accessoryElement = doc.createElement("accessory");
                    accessoryElement.appendChild(createElementWithText(doc, "name", sanitizeInput(accessory.getName())));
                    accessoryElement.appendChild(createElementWithText(doc, "price", String.valueOf((double) accessory.getPrice()))); // Cast to int
                    accessoriesElement.appendChild(accessoryElement);
                }
                newProduct.appendChild(accessoriesElement);
            }

            newProduct.appendChild(createElementWithText(doc, "category", category));

            NodeList categoryList = doc.getElementsByTagName(category);
            if (categoryList.getLength() > 0) {
                categoryList.item(0).appendChild(newProduct);
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"message\":\"Category not found.\"}");
                return;
            }

            // Debug: Print XML structure before writing to file
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            DOMSource source = new DOMSource(doc);
            //StreamResult consoleResult = new StreamResult(System.out);  // Print to console for debugging
            //transformer.transform(source, consoleResult);

            // Write back to the XML file
            StreamResult fileResult = new StreamResult(new File(xmlFilePath));
            transformer.transform(source, fileResult);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\":\"Product inserted successfully!\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\":\"Error inserting product.\"}");
        }
    }

    private String sanitizeInput(String input) {
        return input != null ? input.trim() : "";
    }

    private double parseDoubleOrDefault(String value, double defaultValue) {
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        value = value.replaceAll(",", ""); // Remove commas if present
    
        // Check for multiple decimal points
        if (value.chars().filter(ch -> ch == '.').count() > 1) {
            System.err.println("Invalid number format: " + value);
            return defaultValue; // Return default in case of error
        }
    
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return defaultValue;
        }
    }

    private Element createElementWithText(Document doc, String tagName, String textContent) {
        Element element = doc.createElement(tagName);
        element.setTextContent(textContent);
        return element;
    }

    private String generateProductId(String category) {
        return category.toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
