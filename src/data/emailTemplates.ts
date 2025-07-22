export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  category: 'newsletter' | 'promotional' | 'transactional' | 'welcome';
  thumbnail: string;
  html: string;
  createdDate: string;
  lastModified: string;
  usageCount: number;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: 'Summer Sale Newsletter',
    subject: '🏖️ Summer Sale - Up to 50% Off!',
    category: 'promotional',
    thumbnail: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=300',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Summer Sale</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .hero-text { font-size: 24px; color: #1a202c; margin-bottom: 20px; text-align: center; }
        .discount-badge { background-color: #f56565; color: white; padding: 15px 30px; border-radius: 50px; font-size: 20px; font-weight: bold; display: inline-block; margin: 20px 0; }
        .cta-button { background-color: #4299e1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0; }
        .footer { background-color: #edf2f7; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ SUMMER SALE</h1>
        </div>
        <div class="content">
            <h2 class="hero-text">Hi {{firstName}},</h2>
            <p style="font-size: 18px; line-height: 1.6; color: #4a5568;">
                The summer heat is here, and so are our hottest deals! Don't miss out on incredible savings across our entire collection.
            </p>
            <div style="text-align: center;">
                <span class="discount-badge">UP TO 50% OFF</span>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                From trendy summer outfits to essential accessories, everything you need for the perfect summer is now available at unbeatable prices.
            </p>
            <div style="text-align: center;">
                <a href="#" class="cta-button">SHOP NOW</a>
            </div>
            <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 30px;">
                *Sale ends July 31st. Terms and conditions apply.
            </p>
        </div>
        <div class="footer">
            <p>Thanks for being a valued customer!</p>
            <p>WebSparks AI | 123 Business St, City, State 12345</p>
        </div>
    </div>
</body>
</html>`,
    createdDate: '2024-01-10',
    lastModified: '2024-01-15',
    usageCount: 12
  },
  {
    id: 2,
    name: 'Welcome Email Series',
    subject: 'Welcome to our community! 👋',
    category: 'welcome',
    thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #4299e1; padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 40px 20px; }
        .welcome-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .cta-button { background-color: #48bb78; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0; }
        .feature-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background-color: #edf2f7; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to WebSparks AI! 👋</h1>
        </div>
        <div class="content">
            <div class="welcome-icon">🎉</div>
            <h2 style="color: #2d3748; text-align: center;">Hi {{firstName}}, Welcome aboard!</h2>
            <p style="font-size: 18px; line-height: 1.6; color: #4a5568;">
                We're thrilled to have you join our community! You've just taken the first step towards transforming your business with AI-powered solutions.
            </p>
            
            <div class="feature-box">
                <h3 style="color: #2d3748; margin-top: 0;">🚀 What's Next?</h3>
                <ul style="color: #4a5568; line-height: 1.8;">
                    <li>Explore our comprehensive dashboard</li>
                    <li>Set up your first AI automation</li>
                    <li>Join our community forum</li>
                    <li>Schedule a free consultation</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="#" class="cta-button">GET STARTED</a>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                If you have any questions, our support team is here to help. Just reply to this email or visit our help center.
            </p>
        </div>
        <div class="footer">
            <p>Welcome to the future of business automation!</p>
            <p>WebSparks AI | 123 Business St, City, State 12345</p>
        </div>
    </div>
</body>
</html>`,
    createdDate: '2024-01-08',
    lastModified: '2024-01-12',
    usageCount: 25
  },
  {
    id: 3,
    name: 'Monthly Newsletter',
    subject: 'Your Monthly Update - What\'s New',
    category: 'newsletter',
    thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Newsletter</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #805ad5; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; }
        .content { padding: 30px 20px; }
        .article { border-bottom: 1px solid #e2e8f0; padding: 20px 0; }
        .article:last-child { border-bottom: none; }
        .article h3 { color: #2d3748; margin-top: 0; }
        .read-more { color: #805ad5; text-decoration: none; font-weight: bold; }
        .footer { background-color: #edf2f7; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📰 Monthly Newsletter</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0;">January 2024 Edition</p>
        </div>
        <div class="content">
            <h2 style="color: #2d3748;">Hi {{firstName}},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                Here's what's been happening this month at WebSparks AI and in the world of business automation.
            </p>

            <div class="article">
                <h3>🎯 New AI Features Released</h3>
                <p style="color: #4a5568; line-height: 1.6;">
                    We've launched three new AI automation features that will help streamline your workflow and boost productivity by up to 40%.
                </p>
                <a href="#" class="read-more">Read More →</a>
            </div>

            <div class="article">
                <h3>📊 Industry Insights</h3>
                <p style="color: #4a5568; line-height: 1.6;">
                    Our latest research shows that businesses using AI automation are seeing 3x faster growth compared to traditional methods.
                </p>
                <a href="#" class="read-more">Read More →</a>
            </div>

            <div class="article">
                <h3>🏆 Customer Success Story</h3>
                <p style="color: #4a5568; line-height: 1.6;">
                    Learn how TechCorp increased their efficiency by 60% using our AI solutions in just 3 months.
                </p>
                <a href="#" class="read-more">Read More →</a>
            </div>

            <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #2d3748; margin-top: 0;">💡 Tip of the Month</h3>
                <p style="color: #4a5568; margin-bottom: 0;">
                    Start small with automation. Pick one repetitive task and automate it first, then gradually expand to other areas.
                </p>
            </div>
        </div>
        <div class="footer">
            <p>Stay ahead with AI automation!</p>
            <p>WebSparks AI | 123 Business St, City, State 12345</p>
        </div>
    </div>
</body>
</html>`,
    createdDate: '2024-01-05',
    lastModified: '2024-01-14',
    usageCount: 8
  },
  {
    id: 4,
    name: 'Order Confirmation',
    subject: 'Your Order Has Been Confirmed',
    category: 'transactional',
    thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #48bb78; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .order-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f7fafc; }
        .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .order-item:last-child { border-bottom: none; }
        .total { font-weight: bold; font-size: 18px; color: #2d3748; }
        .footer { background-color: #edf2f7; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
            <h2 style="color: #2d3748;">Thank you, {{firstName}}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                Your order has been confirmed and is being processed. You'll receive a shipping notification once your items are on their way.
            </p>

            <div class="order-box">
                <h3 style="color: #2d3748; margin-top: 0;">Order Details</h3>
                <p style="color: #4a5568; margin: 5px 0;"><strong>Order Number:</strong> #WS-2024-001</p>
                <p style="color: #4a5568; margin: 5px 0;"><strong>Order Date:</strong> January 15, 2024</p>
                <p style="color: #4a5568; margin: 5px 0;"><strong>Estimated Delivery:</strong> January 20-22, 2024</p>
            </div>

            <div class="order-box">
                <h3 style="color: #2d3748; margin-top: 0;">Items Ordered</h3>
                <div class="order-item">
                    <span style="color: #4a5568;">AI Automation Pro Plan</span>
                    <span style="color: #2d3748; font-weight: bold;">$99.00</span>
                </div>
                <div class="order-item">
                    <span style="color: #4a5568;">Setup & Training Session</span>
                    <span style="color: #2d3748; font-weight: bold;">$49.00</span>
                </div>
                <div class="order-item total">
                    <span>Total</span>
                    <span>$148.00</span>
                </div>
            </div>

            <div style="background-color: #e6fffa; border: 1px solid #81e6d9; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #234e52; margin: 0; font-weight: bold;">
                    🎉 Welcome to AI Automation Pro! Check your email for setup instructions.
                </p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                If you have any questions about your order, please don't hesitate to contact our support team.
            </p>
        </div>
        <div class="footer">
            <p>Thank you for choosing WebSparks AI!</p>
            <p>WebSparks AI | 123 Business St, City, State 12345</p>
        </div>
    </div>
</body>
</html>`,
    createdDate: '2024-01-03',
    lastModified: '2024-01-10',
    usageCount: 45
  },
  {
    id: 5,
    name: 'Product Launch Announcement',
    subject: '🚀 Introducing Our Revolutionary New Product!',
    category: 'promotional',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Launch</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #1a202c; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .product-image { width: 100%; max-width: 400px; height: 200px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 12px; margin: 20px auto; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
        .feature-list { background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { display: flex; align-items: center; margin: 10px 0; }
        .feature-icon { color: #48bb78; margin-right: 10px; font-weight: bold; }
        .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0; }
        .footer { background-color: #2d3748; padding: 20px; text-align: center; color: #a0aec0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 PRODUCT LAUNCH</h1>
        </div>
        <div class="content">
            <h2 style="color: #2d3748; text-align: center;">Hi {{firstName}},</h2>
            <p style="font-size: 18px; line-height: 1.6; color: #4a5568; text-align: center;">
                The future of AI automation is here, and we're excited to share it with you first!
            </p>
            
            <div class="product-image">
                AI AUTOMATION 3.0
            </div>

            <h3 style="color: #2d3748; text-align: center; font-size: 24px;">Introducing AI Automation 3.0</h3>
            
            <div class="feature-list">
                <h4 style="color: #2d3748; margin-top: 0;">✨ What's New:</h4>
                <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span style="color: #4a5568;">10x faster processing with advanced neural networks</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span style="color: #4a5568;">Natural language interface - talk to your AI</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span style="color: #4a5568;">Seamless integration with 500+ business tools</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span style="color: #4a5568;">Advanced analytics and predictive insights</span>
                </div>
            </div>

            <div style="text-align: center; background-color: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #c53030; margin: 0 0 10px 0;">🎯 Early Bird Special</h3>
                <p style="color: #742a2a; margin: 0; font-size: 18px; font-weight: bold;">
                    50% OFF for the first 100 customers!
                </p>
            </div>

            <div style="text-align: center;">
                <a href="#" class="cta-button">GET EARLY ACCESS</a>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                This is a limited-time offer exclusively for our valued customers. Don't miss your chance to be among the first to experience the next generation of AI automation.
            </p>
        </div>
        <div class="footer">
            <p>Be part of the AI revolution!</p>
            <p>WebSparks AI | 123 Business St, City, State 12345</p>
        </div>
    </div>
</body>
</html>`,
    createdDate: '2024-01-12',
    lastModified: '2024-01-16',
    usageCount: 18
  }
];