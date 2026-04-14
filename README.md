# 🍔 FoodCompare: Real-Time Delivery Price Aggregator

**Live Demo:** https://food-compare-app-19ji.vercel.app/

FoodCompare is a full-stack Next.js web application designed to solve the "delivery tax" problem. It aggregates real-time pricing data from major food delivery platforms (Zomato and Swiggy) to instantly calculate the lowest base prices, delivery fees, and hidden taxes for specific menu items.

## ✨ Key Features
* **Smart Aggregation:** Instantly compares total checkout prices across multiple platforms.
* **Algorithmic Sorting:** Users can sort dynamically by "Biggest Savings Gap" to find the most heavily contested delivery deals.
* **Real-Time Savings Dashboard:** Utilizes JavaScript `.reduce()` to calculate and display the exact monetary value saved across a user's favorited items.
* **UX-Optimized Loading:** Features custom asynchronous skeleton loaders to handle database latency without degrading user experience.
* **Deep Linking:** Generates smart outbound search queries to route users directly to the platform with the lowest price.

## 🛠️ Tech Stack
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Backend & Auth:** Supabase
* **Database:** PostgreSQL
* **Deployment:** Vercel (CI/CD)

## 💡 Technical Highlights
This application was engineered with a focus on clean state management and efficient data manipulation. The smart-sort functionality chains multiple Array methods (`.filter().sort()`) to derive complex state natively on the client without requiring redundant database calls, ensuring a lightning-fast UI.