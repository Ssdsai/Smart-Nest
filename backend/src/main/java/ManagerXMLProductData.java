import com.google.gson.annotations.SerializedName;

public class ManagerXMLProductData {
    @SerializedName("category")
    private String category;

    @SerializedName("productName")
    private String productName;

    @SerializedName("imageLink")
    private String imageLink;

    @SerializedName("price")
    private double price;

    @SerializedName("discount")
    private double discount_display; // Changed from "discount_display" to "discount" to match your payload

    @SerializedName("manufactureRebate")
    private double rebate; // Changed from "rebate" to "manufactureRebate" to match your payload

    @SerializedName("onSale")
    private boolean onSale;

    @SerializedName("description")
    private String description;

    @SerializedName("accessories")
    private ManagerXMLAccessory[] accessories;

    // Getters and Setters
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getImageLink() {
        return imageLink;
    }

    public void setImageLink(String imageLink) {
        this.imageLink = imageLink;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getDiscount_display() {
        return discount_display;
    }

    public void setDiscount_display(double discount_display) {
        this.discount_display = discount_display;
    }

    public double getRebate() {
        return rebate;
    }

    public void setRebate(double rebate) {
        this.rebate = rebate;
    }

    public boolean isOnSale() {
        return onSale;
    }

    public void setOnSale(boolean onSale) {
        this.onSale = onSale;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ManagerXMLAccessory[] getAccessories() {
        return accessories;
    }

    public void setAccessories(ManagerXMLAccessory[] accessories) {
        this.accessories = accessories;
    }
}
