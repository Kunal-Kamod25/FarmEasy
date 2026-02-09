# FarmEasy 🌱

FarmEasy is a B2C (Business to Customer) e-commerce platform designed specifically for farmers.  
It allows farmers to purchase agricultural products such as seeds, fertilizers, pesticides, tools, and farming equipment directly from companies without involving middlemen.


# Problem Statement
Farmers in rural areas often face difficulty accessing quality agricultural products at affordable prices and reliable sources.

## Solution
FarmEasy provides a direct-to-farmer online marketplace that reduces cost, saves time, and improves access to verified agricultural products.

## Features
- Direct purchase from companies
- User-friendly interface
- Order and inquiry support
- Mobile-friendly design

## Technology Stack
- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL

## Project Type
B2C E-commerce Website

## Database Setup

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Create database
CREATE DATABASE farmeasy;
exit

# 3. Import schema
mysql -u root -p farmeasy < schema.sql
