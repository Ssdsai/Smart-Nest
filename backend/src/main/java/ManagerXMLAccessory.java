import com.google.gson.annotations.SerializedName;

public class ManagerXMLAccessory {
    @SerializedName("name")
    private String name;

    @SerializedName("price")
    private double price;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
