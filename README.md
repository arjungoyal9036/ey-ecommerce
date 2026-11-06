# Good Goods

A static storefront built with HTML, CSS, and JavaScript. It has no build step, Python dependency, database, or backend service. Sign-in, account creation, and checkout are demo-only.

## Deploy on an Azure Linux VM

Install and start Apache or Nginx, then allow HTTP/HTTPS traffic in the VM firewall and the Azure network security group. Clone the repository and deploy only the public storefront files:

```bash
git clone https://github.com/arjungoyal9036/ey-ecommerce.git
cd ey-ecommerce
sudo bash deploy.sh /var/www/html
```

The site is available at the VM's public IP address. `index.html` is the web-server entry point and forwards visitors to `home.html`.

The deployment script installs only the storefront HTML, CSS, JavaScript, and image files. Do not copy the whole repository into the public web root: the repository also contains `.git` metadata, Python source, and `shopping_data.csv`, which are not website assets and should not be publicly accessible.

If another site already uses `/var/www/html`, deploy this site to its own web root and configure a separate Apache virtual host or Nginx server block rather than mixing the two sites' files.
