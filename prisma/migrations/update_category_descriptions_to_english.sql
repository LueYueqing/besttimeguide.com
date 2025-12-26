-- Update category descriptions to English
-- Run this SQL in your database to update category descriptions

UPDATE categories 
SET description = 'Discover the best time to visit destinations around the world. Expert travel guides with weather data, crowd levels, and pricing insights.'
WHERE slug = 'travel';

UPDATE categories 
SET description = 'Learn the optimal posting times for maximum engagement on social media platforms. Data-driven insights for Instagram, TikTok, Facebook, and more.'
WHERE slug = 'social-media';

UPDATE categories 
SET description = 'Find the best time to take supplements and medications for optimal effectiveness. Expert health and wellness timing guides.'
WHERE slug = 'health';

UPDATE categories 
SET description = 'Discover the best time to buy products and make purchases for maximum savings. Shopping timing strategies and deal calendars.'
WHERE slug = 'shopping';

UPDATE categories 
SET description = 'Optimize your daily routines and activities with expert timing advice. Lifestyle guides for exercise, sleep, productivity, and more.'
WHERE slug = 'lifestyle';
