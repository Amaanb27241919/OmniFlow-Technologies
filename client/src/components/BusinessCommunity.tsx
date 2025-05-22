import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  Video, 
  Calendar, 
  Book,
  Search,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  PlusCircle,
  Filter,
  Tag,
  HelpCircle,
  BookOpen,
  Award,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AuditResults } from "@/lib/auditTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface BusinessCommunityProps {
  auditData: AuditResults;
}

interface CommunityMember {
  id: number;
  name: string;
  company: string;
  industry: string;
  location: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
  connectionStatus: 'not-connected' | 'pending' | 'connected';
  mutualConnections: number;
  expertise: string[];
}

interface CommunityPost {
  id: number;
  authorId: number;
  authorName: string;
  authorCompany: string;
  authorAvatar: string;
  postedAt: string;
  content: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  attachments?: {
    type: 'image' | 'document' | 'link';
    url: string;
    title?: string;
  }[];
  commentsList?: {
    id: number;
    authorName: string;
    authorAvatar: string;
    content: string;
    postedAt: string;
    likes: number;
  }[];
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'webinar' | 'workshop' | 'networking' | 'panel';
  host: string;
  description: string;
  attendees: number;
  isRegistered: boolean;
  tags: string[];
}

interface Resource {
  id: number;
  title: string;
  type: 'guide' | 'template' | 'case-study' | 'video' | 'webinar-recording';
  description: string;
  author: string;
  publishedAt: string;
  tags: string[];
  downloadCount: number;
  rating: number;
}

export default function BusinessCommunity({ auditData }: BusinessCommunityProps) {
  const [activeTab, setActiveTab] = useState('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [commentText, setCommentText] = useState('');
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  
  // Generate members based on the user's industry
  const generateCommunityMembers = (): CommunityMember[] => {
    const userIndustry = auditData.industry;
    
    const industries = [
      'Retail', 'Professional Services', 'Healthcare', 'Technology', 
      'Manufacturing', 'Finance', 'Education', 'Hospitality', 'Construction'
    ];
    
    // Remove the user's industry from the list
    const otherIndustries = industries.filter(industry => industry.toLowerCase() !== userIndustry.toLowerCase());
    
    // Generate 15 community members
    return Array(15).fill(null).map((_, index) => {
      // Determine if this member should be from the same industry (50% chance)
      const sameIndustry = index < 8;
      const industry = sameIndustry ? userIndustry : otherIndustries[Math.floor(Math.random() * otherIndustries.length)];
      
      // Generate random connection status with more emphasis on not-connected
      const connectionStatusRand = Math.random();
      let connectionStatus: 'not-connected' | 'pending' | 'connected';
      if (connectionStatusRand < 0.6) {
        connectionStatus = 'not-connected';
      } else if (connectionStatusRand < 0.8) {
        connectionStatus = 'pending';
      } else {
        connectionStatus = 'connected';
      }
      
      // Generate random expertise areas
      const expertiseAreas = [
        'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Technology', 
        'Customer Service', 'Product Development', 'E-commerce', 'Social Media',
        'Business Strategy', 'Automation', 'AI Implementation', 'Process Optimization'
      ];
      
      // Randomly select 1-3 expertise areas
      const numExpertise = 1 + Math.floor(Math.random() * 3);
      const expertise = [];
      for (let i = 0; i < numExpertise; i++) {
        const randomExpertise = expertiseAreas[Math.floor(Math.random() * expertiseAreas.length)];
        if (!expertise.includes(randomExpertise)) {
          expertise.push(randomExpertise);
        }
      }
      
      // Generate a realistic name
      const firstNames = ['Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'John', 'Amanda', 'Robert', 'Jennifer', 'Chris', 'Lisa', 'Tom', 'Sophia', 'James', 'Emma'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez'];
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Generate a company name based on industry
      const companyPrefixes = ['Global', 'Advanced', 'Premier', 'Elite', 'Innovative', 'Next-Gen', 'Strategic', 'Prime', 'Dynamic', 'Modern'];
      const companyTypes = {
        'Retail': ['Shop', 'Store', 'Mart', 'Boutique', 'Emporium'],
        'Professional Services': ['Consulting', 'Advisors', 'Associates', 'Partners', 'Solutions'],
        'Healthcare': ['Care', 'Health', 'Wellness', 'Medical', 'Therapeutics'],
        'Technology': ['Tech', 'Systems', 'Solutions', 'Digital', 'Innovations'],
        'Manufacturing': ['Manufacturing', 'Industries', 'Products', 'Fabrication', 'Works'],
        'Finance': ['Financial', 'Capital', 'Investments', 'Advisors', 'Wealth'],
        'Education': ['Learning', 'Education', 'Academy', 'Institute', 'School'],
        'Hospitality': ['Hospitality', 'Hotels', 'Resorts', 'Services', 'Experiences'],
        'Construction': ['Construction', 'Builders', 'Developers', 'Properties', 'Structures']
      };
      
      const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
      const type = companyTypes[industry as keyof typeof companyTypes][Math.floor(Math.random() * companyTypes[industry as keyof typeof companyTypes].length)];
      
      const company = `${prefix} ${type}`;
      
      // Generate random locations
      const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA'];
      
      // Generate avatar fallback using initials
      const initials = `${firstName[0]}${lastName[0]}`;
      
      return {
        id: index + 1,
        name: `${firstName} ${lastName}`,
        company,
        industry,
        location: locations[Math.floor(Math.random() * locations.length)],
        avatar: '', // No actual image URLs for demo
        isOnline: Math.random() > 0.7,
        lastActive: `${Math.floor(Math.random() * 24)}h ago`,
        connectionStatus,
        mutualConnections: Math.floor(Math.random() * 15),
        expertise
      };
    });
  };
  
  // Generate community posts
  const generateCommunityPosts = (members: CommunityMember[]): CommunityPost[] => {
    const postTopics = [
      {
        topic: 'Workflow automation success',
        content: 'Just implemented a new workflow automation system and it\'s already saving us 15 hours per week! Happy to share details with anyone interested.'
      },
      {
        topic: 'AI implementation challenges',
        content: 'We\'re struggling with implementing AI in our customer service. Has anyone here successfully integrated AI chatbots without losing the personal touch?'
      },
      {
        topic: 'Business process optimization',
        content: 'After our recent business audit, we completely redesigned our client onboarding process. Turnaround time dropped from 5 days to just 6 hours! The key was eliminating these 3 bottlenecks...'
      },
      {
        topic: 'Integration between systems',
        content: 'Finally got our CRM, accounting software, and project management tools talking to each other! No more double data entry. Here is how we did it...'
      },
      {
        topic: 'Operational efficiency improvements',
        content: 'We increased our operational efficiency by 32% this quarter using the recommendations from our business audit. The biggest win was reorganizing our team structure to...'
      },
      {
        topic: 'Marketing automation ROI',
        content: 'Our marketing automation system is showing incredible ROI. We\'ve seen a 27% increase in qualified leads while reducing our marketing team\'s manual work by 40%.'
      },
      {
        topic: 'Customer retention strategies',
        content: 'Just wanted to share that our new customer retention program has reduced churn by 18% in just two months. The key components include automated check-ins, personalized offers, and...'
      },
      {
        topic: 'Staff productivity tools',
        content: 'Looking for recommendations on the best productivity tools for a small team. We need something that integrates task management, time tracking, and collaboration features.'
      }
    ];
    
    // Tags related to business processes and automation
    const tags = [
      'WorkflowAutomation', 'AI', 'ProcessOptimization', 'Efficiency',
      'SmallBusiness', 'ROI', 'Integration', 'CustomerService',
      'Marketing', 'TeamProductivity', 'BusinessGrowth', 'CostReduction'
    ];
    
    return postTopics.map((topic, index) => {
      // Select a random member as the author
      const author = members[Math.floor(Math.random() * members.length)];
      
      // Generate a random date within the last 7 days
      const currentDate = new Date();
      const randomDaysAgo = Math.floor(Math.random() * 7);
      const randomHoursAgo = Math.floor(Math.random() * 24);
      const postDate = new Date(currentDate);
      postDate.setDate(postDate.getDate() - randomDaysAgo);
      postDate.setHours(postDate.getHours() - randomHoursAgo);
      
      // Format the date
      const postedAt = randomDaysAgo > 0 
        ? `${randomDaysAgo}d ago` 
        : `${randomHoursAgo}h ago`;
      
      // Generate random engagement metrics
      const likes = Math.floor(Math.random() * 50);
      const comments = Math.floor(Math.random() * 20);
      
      // Randomly select 1-3 tags
      const numTags = 1 + Math.floor(Math.random() * 3);
      const postTags = [];
      for (let i = 0; i < numTags; i++) {
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        if (!postTags.includes(randomTag)) {
          postTags.push(randomTag);
        }
      }
      
      // Generate mock comments
      const commentsList = Array(comments).fill(null).map((_, commentIndex) => {
        const commentAuthor = members[Math.floor(Math.random() * members.length)];
        
        return {
          id: commentIndex + 1,
          authorName: commentAuthor.name,
          authorAvatar: commentAuthor.avatar,
          content: `This is really insightful! We've been dealing with similar challenges in our ${commentAuthor.industry.toLowerCase()} business.`,
          postedAt: `${Math.floor(Math.random() * 24)}h ago`,
          likes: Math.floor(Math.random() * 10)
        };
      });
      
      return {
        id: index + 1,
        authorId: author.id,
        authorName: author.name,
        authorCompany: author.company,
        authorAvatar: author.avatar,
        postedAt,
        content: topic.content,
        likes,
        comments,
        isLiked: Math.random() > 0.7,
        isBookmarked: Math.random() > 0.8,
        tags: postTags,
        commentsList
      };
    });
  };
  
  // Generate events
  const generateEvents = (): Event[] => {
    const eventTitles = [
      {
        title: 'Maximizing ROI from Workflow Automation',
        type: 'webinar',
        description: 'Learn how to calculate and maximize the return on investment from your workflow automation initiatives.'
      },
      {
        title: 'AI Implementation Workshop for Small Businesses',
        type: 'workshop',
        description: 'A hands-on workshop where you\'ll learn practical ways to implement AI in your small business without breaking the bank.'
      },
      {
        title: 'Business Process Optimization Networking',
        type: 'networking',
        description: 'Connect with other business owners who are focused on optimizing their business processes.'
      },
      {
        title: 'Expert Panel: Scaling Your Business with Automation',
        type: 'panel',
        description: 'Hear from successful entrepreneurs who have scaled their businesses using automation technologies.'
      },
      {
        title: 'Digital Transformation for Traditional Businesses',
        type: 'webinar',
        description: 'Learn how traditional businesses can embrace digital transformation to stay competitive.'
      },
      {
        title: 'Practical Strategies for Customer Retention',
        type: 'workshop',
        description: 'Discover actionable strategies to improve customer retention and lifetime value.'
      }
    ];
    
    // Generate future dates within the next 30 days
    const generateFutureDate = () => {
      const currentDate = new Date();
      const randomDaysAhead = 1 + Math.floor(Math.random() * 30);
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate() + randomDaysAhead);
      return futureDate;
    };
    
    // Business automation related tags
    const tags = [
      'Automation', 'AI', 'SmallBusiness', 'DigitalTransformation',
      'ProcessOptimization', 'BusinessGrowth', 'Productivity', 'ROI'
    ];
    
    return eventTitles.map((event, index) => {
      const eventDate = generateFutureDate();
      
      // Format the date
      const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Generate a random time
      const hours = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'} ET`;
      
      // Generate random number of attendees
      const attendees = 10 + Math.floor(Math.random() * 90);
      
      // Randomly select 1-3 tags
      const numTags = 1 + Math.floor(Math.random() * 3);
      const eventTags = [];
      for (let i = 0; i < numTags; i++) {
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        if (!eventTags.includes(randomTag)) {
          eventTags.push(randomTag);
        }
      }
      
      return {
        id: index + 1,
        title: event.title,
        date: formattedDate,
        time: formattedTime,
        type: event.type as 'webinar' | 'workshop' | 'networking' | 'panel',
        host: 'OmniFlow Business Community',
        description: event.description,
        attendees,
        isRegistered: Math.random() > 0.7,
        tags: eventTags
      };
    });
  };
  
  // Generate resources
  const generateResources = (): Resource[] => {
    const resourcesList = [
      {
        title: 'The Complete Guide to Business Process Automation',
        type: 'guide',
        description: 'A comprehensive guide covering everything from identifying automation opportunities to implementing and measuring success.'
      },
      {
        title: 'Workflow Optimization Toolkit',
        type: 'template',
        description: 'Ready-to-use templates for mapping, analyzing, and optimizing your business workflows.'
      },
      {
        title: 'How ABC Company Increased Efficiency by 45% with Automation',
        type: 'case-study',
        description: 'An in-depth case study showing how a small business transformed their operations with targeted automation.'
      },
      {
        title: 'AI Implementation for Non-Technical Business Owners',
        type: 'video',
        description: 'A step-by-step video tutorial on how to implement AI solutions without technical expertise.'
      },
      {
        title: 'ROI Calculator for Business Process Improvement',
        type: 'template',
        description: 'An Excel template to help you calculate the return on investment for your process improvement initiatives.'
      },
      {
        title: 'Digital Transformation Success Stories',
        type: 'webinar-recording',
        description: 'Recording of our popular webinar featuring small businesses that successfully implemented digital transformation.'
      },
      {
        title: 'Customer Journey Automation Blueprint',
        type: 'guide',
        description: 'Learn how to automate your customer journey from first contact to loyal customer.'
      },
      {
        title: 'Smart Business Metrics Dashboard Template',
        type: 'template',
        description: 'A customizable dashboard template to track your key business metrics and improvement progress.'
      }
    ];
    
    // Generate publish dates within the last 6 months
    const generatePastDate = () => {
      const currentDate = new Date();
      const randomMonthsAgo = Math.floor(Math.random() * 6);
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const pastDate = new Date(currentDate);
      pastDate.setMonth(pastDate.getMonth() - randomMonthsAgo);
      pastDate.setDate(pastDate.getDate() - randomDaysAgo);
      return pastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    // Resource tags
    const tags = [
      'BusinessProcesses', 'Automation', 'Efficiency', 'DigitalTransformation',
      'SmallBusiness', 'ROI', 'AI', 'Productivity', 'CaseStudy', 'Guide'
    ];
    
    return resourcesList.map((resource, index) => {
      // Generate random download count
      const downloadCount = 50 + Math.floor(Math.random() * 950);
      
      // Generate random rating between 3.5 and 5.0
      const rating = 3.5 + Math.random() * 1.5;
      
      // Randomly select 1-3 tags
      const numTags = 1 + Math.floor(Math.random() * 3);
      const resourceTags = [];
      for (let i = 0; i < numTags; i++) {
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        if (!resourceTags.includes(randomTag)) {
          resourceTags.push(randomTag);
        }
      }
      
      return {
        id: index + 1,
        title: resource.title,
        type: resource.type as 'guide' | 'template' | 'case-study' | 'video' | 'webinar-recording',
        description: resource.description,
        author: 'OmniFlow Business Community',
        publishedAt: generatePastDate(),
        tags: resourceTags,
        downloadCount,
        rating
      };
    });
  };
  
  // Generate community data
  const members = generateCommunityMembers();
  const posts = generateCommunityPosts(members);
  const events = generateEvents();
  const resources = generateResources();
  
  // Filter members based on search and industry filter
  const filteredMembers = members.filter(member => {
    // Apply search filter
    const matchesSearch = searchQuery.trim() === '' || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply industry filter
    const matchesIndustry = industryFilter === 'all' || member.industry.toLowerCase() === industryFilter.toLowerCase();
    
    return matchesSearch && matchesIndustry;
  });
  
  // Filter posts based on search
  const filteredPosts = posts.filter(post => {
    return searchQuery.trim() === '' || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Filter events based on search
  const filteredEvents = events.filter(event => {
    return searchQuery.trim() === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  
  // Filter resources based on search
  const filteredResources = resources.filter(resource => {
    return searchQuery.trim() === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  
  // Handle network connection request
  const handleConnect = (memberId: number) => {
    toast({
      title: "Connection Request Sent",
      description: "Your connection request has been sent successfully.",
    });
  };
  
  // Handle event registration
  const handleRegister = (eventId: number) => {
    toast({
      title: "Registration Successful",
      description: "You've been registered for the event. Check your email for details.",
    });
  };
  
  // Handle resource download
  const handleDownload = (resourceId: number) => {
    toast({
      title: "Download Started",
      description: "Your resource is being downloaded.",
    });
  };
  
  // Handle post interaction
  const handlePostInteraction = (action: 'like' | 'comment' | 'bookmark' | 'share', postId: number) => {
    switch (action) {
      case 'like':
        toast({
          title: "Post Liked",
          description: "You've liked this post.",
        });
        break;
      case 'comment':
        if (commentText.trim() === '') {
          toast({
            title: "Empty Comment",
            description: "Please enter a comment before submitting.",
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Comment Added",
          description: "Your comment has been added to the post.",
        });
        
        setCommentText('');
        break;
      case 'bookmark':
        toast({
          title: "Post Bookmarked",
          description: "This post has been added to your bookmarks.",
        });
        break;
      case 'share':
        toast({
          title: "Share Options",
          description: "Share options opened.",
        });
        break;
    }
  };
  
  // Get icon for event type
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar':
        return <Video className="h-4 w-4" />;
      case 'workshop':
        return <BookOpen className="h-4 w-4" />;
      case 'networking':
        return <Users className="h-4 w-4" />;
      case 'panel':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };
  
  // Get icon for resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <Book className="h-4 w-4" />;
      case 'template':
        return <BookOpen className="h-4 w-4" />;
      case 'case-study':
        return <Award className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'webinar-recording':
        return <Video className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };
  
  // Render star rating
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array(fullStars).fill(null).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
          </svg>
        ))}
        
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
          </svg>
        )}
        
        {Array(5 - fullStars - (hasHalfStar ? 1 : 0)).fill(null).map((_, i) => (
          <svg key={i + fullStars + (hasHalfStar ? 1 : 0)} className="w-4 h-4 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
          </svg>
        ))}
        
        <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Business Community</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search community..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Connect with Similar Businesses</h4>
              <p className="text-sm text-gray-600 mb-4">
                Build your network by connecting with other business owners in your industry or with similar challenges.
                Share experiences, ask questions, and learn from each other's successes.
              </p>
              
              <div className="flex items-center justify-between">
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="professional services">Professional Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="text-sm text-gray-500">
                  Showing {filteredMembers.length} of {members.length} members
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Avatar className="h-12 w-12 mr-3">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        ) : (
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h5 className="font-medium">{member.name}</h5>
                          {member.isOnline && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.company}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="inline-block mr-3">{member.industry}</span>
                          <span>{member.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {member.expertise.map((area, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-700">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      
                      {member.connectionStatus === 'connected' ? (
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-green-600 flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                          <span className="text-xs text-gray-500">
                            {member.mutualConnections} mutual connections
                          </span>
                        </div>
                      ) : member.connectionStatus === 'pending' ? (
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-orange-600">
                            Connection Pending
                          </span>
                          <span className="text-xs text-gray-500">
                            {member.mutualConnections} mutual connections
                          </span>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full mt-3"
                          onClick={() => handleConnect(member.id)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredMembers.length === 0 && (
              <div className="text-center py-10">
                <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No members found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </TabsContent>
          
          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Join the Conversation</h4>
              <p className="text-sm text-gray-600 mb-4">
                Learn from other business owners implementing automation and process improvements.
                Share your experiences, ask questions, and get advice from peers.
              </p>
              
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Start a New Discussion
              </Button>
            </div>
            
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Avatar className="h-10 w-10 mr-3">
                      {post.authorAvatar ? (
                        <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                      ) : (
                        <AvatarFallback>{post.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{post.authorName}</h5>
                        <span className="text-xs text-gray-500">{post.postedAt}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{post.authorCompany}</p>
                      <p className="text-sm">{post.content}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs font-normal">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between mt-4 pt-3 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-xs px-2 ${post.isLiked ? 'text-blue-600' : ''}`}
                          onClick={() => handlePostInteraction('like', post.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{post.likes}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{post.comments}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`text-xs px-2 ${post.isBookmarked ? 'text-blue-600' : ''}`}
                          onClick={() => handlePostInteraction('bookmark', post.id)}
                        >
                          <Bookmark className="h-4 w-4 mr-1" />
                          <span>Save</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => handlePostInteraction('share', post.id)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          <span>Share</span>
                        </Button>
                      </div>
                      
                      {/* Comments Section */}
                      {expandedPost === post.id && (
                        <div className="mt-4 pt-3 border-t">
                          <h6 className="font-medium text-sm mb-3">Comments</h6>
                          
                          {post.commentsList && post.commentsList.length > 0 ? (
                            <div className="space-y-3 mb-3">
                              {post.commentsList.map((comment) => (
                                <div key={comment.id} className="flex items-start">
                                  <Avatar className="h-7 w-7 mr-2">
                                    {comment.authorAvatar ? (
                                      <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                                    ) : (
                                      <AvatarFallback>{comment.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className="flex-1 bg-gray-50 p-2 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium">{comment.authorName}</span>
                                      <span className="text-xs text-gray-500">{comment.postedAt}</span>
                                    </div>
                                    <p className="text-xs mt-1">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mb-3">No comments yet. Be the first to comment!</p>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback>YO</AvatarFallback>
                            </Avatar>
                            <Input
                              placeholder="Add a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="text-sm"
                            />
                            <Button 
                              size="sm"
                              onClick={() => handlePostInteraction('comment', post.id)}
                            >
                              Post
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-10">
                <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No discussions found</h3>
                <p className="text-gray-500">Try adjusting your search or start a new discussion</p>
              </div>
            )}
          </TabsContent>
          
          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Upcoming Events</h4>
              <p className="text-sm text-gray-600 mb-4">
                Join webinars, workshops, and networking events focused on business process optimization,
                automation, and AI implementation strategies.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                    <span className="text-xs">Webinar</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                    <span className="text-xs">Workshop</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>
                    <span className="text-xs">Networking</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></div>
                    <span className="text-xs">Panel</span>
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing {filteredEvents.length} upcoming events
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg mr-4 flex-shrink-0 ${
                        event.type === 'webinar' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'workshop' ? 'bg-green-100 text-green-600' :
                        event.type === 'networking' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium">{event.title}</h5>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{event.date}, {event.time}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {event.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="text-sm text-gray-500">
                            <Users className="h-4 w-4 inline mr-1" />
                            {event.attendees} attendees registered
                          </div>
                          
                          {event.isRegistered ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Registered
                            </Badge>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleRegister(event.id)}
                            >
                              Register Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-10">
                <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No events found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </TabsContent>
          
          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Helpful Resources</h4>
              <p className="text-sm text-gray-600 mb-4">
                Access guides, templates, case studies, and videos to help you implement automation
                and optimize your business processes.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center">
                    <Book className="h-3 w-3 mr-1" />
                    <span className="text-xs">Guides</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    <span className="text-xs">Templates</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    <span className="text-xs">Case Studies</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Video className="h-3 w-3 mr-1" />
                    <span className="text-xs">Videos</span>
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing {filteredResources.length} resources
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg mr-4 flex-shrink-0 ${
                        resource.type === 'guide' ? 'bg-blue-100 text-blue-600' :
                        resource.type === 'template' ? 'bg-green-100 text-green-600' :
                        resource.type === 'case-study' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {getResourceTypeIcon(resource.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium">{resource.title}</h5>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span className="capitalize">{resource.type.replace('-', ' ')}</span>
                              <span className="mx-1">•</span>
                              <span>{resource.publishedAt}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {resource.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="flex items-center">
                            {renderStarRating(resource.rating)}
                            <span className="text-xs text-gray-500 ml-3">
                              {resource.downloadCount} downloads
                            </span>
                          </div>
                          
                          <Button 
                            size="sm"
                            onClick={() => handleDownload(resource.id)}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredResources.length === 0 && (
              <div className="text-center py-10">
                <Book className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No resources found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}