import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-bold mb-6">About TrendBlog</h1>
        
        <Card className="mb-8">
          <CardContent className="prose prose-lg max-w-none pt-6">
            <p className="text-xl text-muted-foreground mb-6">
              Your premier destination for trending insights on AI, finance, startups, and cutting-edge technology.
            </p>

            <h2>Our Mission</h2>
            <p>
              At TrendBlog, we're dedicated to bringing you the most relevant and impactful content
              about the technologies and trends shaping our future. Our team of expert writers and
              industry professionals work tirelessly to deliver high-quality articles that inform,
              educate, and inspire.
            </p>

            <h2>What We Cover</h2>
            <ul>
              <li><strong>AI & Technology:</strong> Latest developments in artificial intelligence, machine learning, and emerging tech</li>
              <li><strong>Finance:</strong> Insights on DeFi, cryptocurrency, and modern financial systems</li>
              <li><strong>Startups:</strong> Entrepreneurship stories, growth strategies, and startup ecosystem trends</li>
              <li><strong>Business:</strong> Industry analysis, market trends, and business innovation</li>
            </ul>

            <h2>Why Choose TrendBlog</h2>
            <p>
              We curate and create content that matters. Every article is carefully researched,
              fact-checked, and written to provide real value to our readers. Whether you're a
              tech enthusiast, investor, entrepreneur, or simply curious about the future, you'll
              find insightful content tailored to your interests.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
