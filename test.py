import numpy as np
import pandas as pd
import csv
import hashlib
import os
import matplotlib.pyplot as plt
import seaborn as sns
data={
    "product_id": [101,102,103,104,105]  ,
    "product_name":['Wireless headphones','watch', 'Phone','Charger','Laptop'],
    "category": ['Electronics','Accessories','Electronics', 'Accessories', 'Electronics'],
    "price":[80.0,45.0,120.0,35.0,150],
    'Stock_count':[15,0,8,50,100]
}

df=pd.DataFrame(data)
print("Original Product Catalog:")
print(df)
def Catalogue(category=None):
    products = df if category is None else search_category(category)
    if products.empty:
        print("No products found in that category")
    else:
        print(products[['product_name', 'product_id']])

def search_category(category):
    normalized_category = category.strip().casefold()
    return df[df['category'].str.casefold() == normalized_category].copy()

def search_product(product_id):
    res=df[df['product_id']==product_id]
    if res.empty:
        print("product not found")
    else:
        return res

def shopping_cart(product_ids,quantity):
    if len(product_ids) != len(quantity):
        raise ValueError("Each product must have a matching quantity")
    if any(not isinstance(item_quantity, int) or item_quantity <= 0 for item_quantity in quantity):
        raise ValueError("Quantities must be positive integers")
    if any(product_id not in df['product_id'].values for product_id in product_ids):
        raise ValueError("One or more product IDs were not found")

    cart_rows = []
    for product_id, item_quantity in zip(product_ids, quantity):
        product = df[df['product_id'] == product_id].iloc[0].copy()
        product['quantity'] = item_quantity
        cart_rows.append(product)
    return pd.DataFrame(cart_rows).reset_index(drop=True)

def shipping_service(subtotal):
    shipping=np.where(subtotal>=300,0,100)
    print("shipping_charges: ",shipping)
    return int(shipping)

def user_login(username,password):
    if username=="" or password=="":
        print("username and password can't be empty")
        return None
    password_hash=hashlib.sha256(password.encode()).hexdigest()
    print("login success")
    return password_hash

def save_data(username,password_hash,cart, subtotal,shipping_charges):
    filename="shopping_data.csv"
    file_exists=os.path.isfile(filename) and os.path.getsize(filename)>0
    with open(filename,'a',newline="") as f:
        writer=csv.writer(f)
        if not file_exists:
            writer.writerow([
                "Username",
                "Password_hash",
                "Product_id",
                "Product_name",
                "Quantity",
                "Price",
                "Total",
                "Subtotal",
                "Shipping_charges",
                "Grand_total"
            ])
        grand_total=subtotal+shipping_charges
        for _, row in cart.iterrows():
            writer.writerow([
                username,
                password_hash,
                row["product_id"],
                row["product_name"],
                row["quantity"],
                row["price"],
                row["total"],
                subtotal,
                shipping_charges,
                grand_total
            ])
        print("Shopping details saved successfully")

def load_sales_data(filename="shopping_data.csv"):
    columns = [
        "Username",
        "Password_hash",
        "Product_id",
        "Product_name",
        "Quantity",
        "Price",
        "Total",
        "Subtotal",
        "Shipping_charges",
        "Grand_total"
    ]
    sales_data = pd.read_csv(filename)
    if "Product_id" not in sales_data.columns:
        sales_data = pd.read_csv(filename, header=None, names=columns)
    sales_data.columns = sales_data.columns.str.strip()
    sales_data["Quantity"] = pd.to_numeric(sales_data["Quantity"])
    sales_data["Total"] = pd.to_numeric(sales_data["Total"])
    return sales_data

def data_visualistion():
    sales_data = load_sales_data()
    product_sales = sales_data.groupby("Product_name")["Quantity"].sum()
    plt.figure(figsize=(10,5))
    product_sales.plot(kind='bar')
    plt.xlabel("Product")
    plt.ylabel("Units sold")
    plt.title("Units sold by product")
    plt.show()

def main():
    username=input("Enter username")
    password=input("Enter password")
    password_hash=user_login(username,password)
    if password_hash is None:
        return
    category = input("Filter by category (press Enter to show all): ").strip()
    Catalogue(category or None)
    a = int(input("Enter the product_id"))
    print(search_product(a))
    b = True
    product_ids=[]
    quantity=[]
    while b:
        c=int(input("Enter the product_ids you want to buy: "))
        d=int(input("Enter the quantity: "))
        product_ids.append(c)
        quantity.append(d)
        e=input("Do you want to add more? (Y/N)")
        if(e=="Y"):
            b=True
        else:
            b=False
    cart=shopping_cart(
        product_ids,
        quantity
    )
    cart['total']=cart['price']*cart['quantity']
    subt=cart['total'].sum()
    shipping_charges=shipping_service(subt)
    print("cart")
    print(cart)
    print(np.sum([subt,shipping_charges]))
    save_data(username,password_hash,cart,subt,shipping_charges)
    s=input("Do u want to visualise the data (y/n)")
    if(s.lower()=="y"):
        data_visualistion()
    else:
        return
if __name__=="__main__":
    main()



