# Good Goods

A static storefront built with HTML, CSS, and JavaScript. It has no build step, Python dependency, database, or backend service. Sign-in, account creation, and checkout are demo-only.

## Deploy on an Azure Linux VM

The storefront is static and needs no build step or runtime. Nginx's default site can serve it from `/var/www/html`; no custom server block is required when that directory is not shared with another site.

On an Ubuntu VM where Apache is currently using port 80, update the existing clone and switch to Nginx:

```bash
cd ~/ey-ecommerce
git pull origin main
sudo systemctl disable --now apache2
sudo apt update
sudo apt install -y nginx
sudo bash deploy.sh /var/www/html
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl status nginx --no-pager
```

If the repository is not cloned yet, clone it before running those commands:

```bash
git clone https://github.com/arjungoyal9036/ey-ecommerce.git
cd ey-ecommerce
```

Allow inbound TCP port 80 in the Azure VM's network security group (and in the VM firewall if one is enabled). Then visit `http://<VM-public-IP>/`. `index.html` is the web-server entry point and forwards visitors to `home.html`. Configure HTTPS separately when you have a domain name and TLS certificate.

The deployment script installs only the storefront HTML, CSS, JavaScript, and image files. Do not copy the whole repository into the public web root: the repository also contains `.git` metadata, Python source, and `shopping_data.csv`, which are not website assets and should not be publicly accessible.

If another site already uses `/var/www/html`, deploy this site to its own web root and configure a separate Nginx server block rather than mixing the two sites' files.
