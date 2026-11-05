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
def Catalogue():
    print(df[['product_name','product_id']])

def search_product(product_id):
    res=df[df['product_id']==product_id]
    if res.empty:
        print("product not found")
    else:
        return res

def shopping_cart(product_ids,quantity):
    if len(product_ids) != len(quantity):
        raise ValueError("Each product must have a matching quantity")

    cart_rows = []
    requested_by_product = {}
    for product_id, item_quantity in zip(product_ids, quantity):
        if not isinstance(item_quantity, int) or item_quantity <= 0:
            raise ValueError("Quantities must be positive integers")
        product_matches = df[df['product_id'] == product_id]
        if product_matches.empty:
            raise ValueError(f"Product {product_id} was not found")

        product = product_matches.iloc[0].copy()
        requested_quantity = requested_by_product.get(product_id, 0) + item_quantity
        if requested_quantity > product['Stock_count']:
            raise ValueError(
                f"Only {product['Stock_count']} units of {product['product_name']} are in stock"
            )
        requested_by_product[product_id] = requested_quantity
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

def data_visualistion():
    df=pd.read_csv("shopping_data.csv",
                   header=None,
                   names=[
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
    df.columns=df.columns.str.strip()
    df['Total']=pd.to_numeric(df['Total'])
    df['Quantity']=pd.to_numeric(df["Quantity"])
    product_sales=df.groupby('Product_name')['Quantity'].sum()
    plt.figure(figsize=(10,5))
    product_sales.plot(kind='bar')
    plt.xlabel("product wise sales")
    plt.ylabel("Sales amount")
    plt.show()

def main():
    username=input("Enter username")
    password=input("Enter password")
    password_hash=user_login(username,password)
    if password_hash is None:
        return
    Catalogue()
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



