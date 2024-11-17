import java.util.Map; // Ensure you import Map

public class DataProductXMLSynchronization {
    // Product fields
    private String id;
    private String product_id;
    private String name;
    private String image;
    public double oprice;
    private double discount;
    private double Discount;
    private double discount_display;
    private double manufactureRebate;
    private String description;
    private String category;
    private Map<String, Double> accessories; // Use Map instead of HashMap
    private String onsale; // New field for onsale status

    // Constructor
    public DataProductXMLSynchronization(String id, String product_id, String name, String category, String image, double oprice,
                   double discount, double Discount, double discount_display, double manufactureRebate, 
                   String description, Map<String, Double> accessories, String onsale) { // Use Map here
        this.id = id;
        this.product_id = product_id;
        this.name = name;
        this.image = image;
        this.oprice = oprice;
        this.discount = discount;
        this.Discount = Discount;
        this.discount_display = discount_display;
        this.manufactureRebate = manufactureRebate;
        this.description = description;
        this.accessories = accessories;
        this.category = category;
        this.onsale = onsale; // Initialize onsale field
    }

    // Getters for all the fields
    public String getProductId() {
        return product_id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public double getOprice() {
        return oprice;
    }

    public double getDiscount() {
        return discount_display;
    }

    public double getManufactureRebate() {
        return manufactureRebate;
    }

    // Getter for onsale
    public String getOnsale() {
        return onsale;
    }

    // toString method for easy printing of product details
    @Override
    public String toString() {
        StringBuilder accessoryList = new StringBuilder();
        for (Map.Entry<String, Double> entry : accessories.entrySet()) {
            accessoryList.append("Accessory Name: ").append(entry.getKey())
                         .append(", Price: ").append(entry.getValue()).append("<br>");
        }
        return "Product [Id=" + id + 
               ", Product_Id=" + product_id +
               ", Name=" + name +
               ", Category=" + category + 
               ", Image=" + image + 
               ", Original Price=" + oprice + 
               ", Discount=" + discount + 
               ", Additional Discount=" + Discount +
               ", Discount Display=" + discount_display +
               ", Manufacture Rebate=" + manufactureRebate + 
               ", Description=" + description + 
               ", Accessories: <br>" + accessoryList.toString() + "]";
    }
}
