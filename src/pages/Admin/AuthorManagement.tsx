import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "./DashboardLayout";
import AuthorSelect from "@/pages/Admin/AuthorSelect";
import {
  Users,
  Plus,
  Search,
  Edit,
  UserCheck,
  FileText,
  Mail,
  Calendar,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { articleService } from "@/services/articleService";
import { apiService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/userService";  

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Author {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'author' | 'editor' | 'user';
  isActive: boolean;
  createdAt: string;
  articleCount?: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export default function AuthorManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showAddAuthorDialog, setShowAddAuthorDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [authorForm, setAuthorForm] = useState({
    bio: '',
    avatar: '',
    role: 'author',
    isActive: true
  });
  const [newAuthorData, setNewAuthorData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    role: 'author'
  });
  const [newAuthorId, setNewAuthorId] = useState('');

  useEffect(() => {
    loadAuthors();
    loadArticles();
  }, []);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      console.log('Loading authors - Current user:', user);
      console.log('User role:', user?.role);
      console.log('Is authenticated:', !!user);

      // Use apiService instead of userService to ensure correct endpoint and credentials
      const response = await apiService.admin.getUsers();
      // Axios returns data in response.data
      if (response.data && response.data.success) {
        // Handle potential data structure variations (data.data or data.data.users)
        const users = Array.isArray(response.data.data) ? response.data.data : response.data.data?.users || [];
        setAuthors(users);
      }
    } catch (error: any) {
      console.error('Error loading authors:', error);
      console.error('Error response:', error.response);
      const isForbidden = error.response?.status === 403;
      toast({
        title: isForbidden ? "Access Denied" : "Error",
        description: isForbidden ? "You do not have permission to view authors. Admin rights required." : "Failed to load authors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      // Get all articles for author reassignment
      const response = await articleService.getAllArticles();
      // @ts-ignore - Response is Article[] directly
      setArticles(response);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const handleUpdateAuthorProfile = async () => {
    if (!selectedAuthor) return;

    try {
      setUpdating(true);

      // Check if role has changed
      const roleChanged = selectedAuthor.role !== authorForm.role;

      // If role changed, update role separately
      if (roleChanged) {
        const { data: roleResponse } = await apiService.admin.updateUserRole(selectedAuthor._id, authorForm.role);
        if (!roleResponse.success) {
          throw new Error(roleResponse.error || 'Failed to update role');
        }
      }

      // Update other profile fields (excluding role since it's handled separately)
      const { role, ...profileData } = authorForm;
      const { data: response } = await apiService.admin.updateUser(selectedAuthor._id, profileData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Author profile updated successfully",
        });
        setShowAuthorDialog(false);
        loadAuthors();
      }
    } catch (error: any) {
      console.error('Error updating author profile:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update author profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAuthor = async () => {  
  if (!newAuthorData.username || !newAuthorData.email || !newAuthorData.password || !newAuthorData.bio) {  
    toast({  
      title: "Validation Error",  
      description: "Please fill in all required fields including bio",  
      variant: "destructive",  
    });  
    return;  
  }  
  
  try {  
    setUpdating(true);  
    const response = await userService.createAuthor(newAuthorData);  
      
    if (response.success) {  
      toast({ title: "Success", description: "Author created successfully" });  
      setShowAddAuthorDialog(false);  
      setNewAuthorData({ username: '', email: '', password: '', bio: '', role: 'author' });  
      loadAuthors();  
    } else {  
      toast({ title: "Error", description: response.error || "Failed to create author", variant: "destructive" });  
    }  
  } catch (error: any) {  
    toast({ title: "Error", description: error.message || "Failed to create author", variant: "destructive" });  
  } finally {  
    setUpdating(false);  
  }  
};

  const handleChangeArticleAuthor = async () => {
    if (!selectedArticle || !selectedArticle.id || !newAuthorId) return;

    try {
      setUpdating(true);
      
      // Use articleService which handles credentials correctly
      const result = await articleService.changeArticleAuthor(selectedArticle.id, newAuthorId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Article author changed successfully",
        });
        setShowArticleDialog(false);
        loadArticles();
      } else {
        throw new Error('Failed to update author');
      }
    } catch (error) {
      console.error('Error changing article author:', error);
      toast({
        title: "Error",
        description: "Failed to change article author",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openAuthorDialog = (author: Author) => {
    setSelectedAuthor(author);
    setAuthorForm({
      bio: author.bio || '',
      avatar: author.avatar || '',
      role: author.role,
      isActive: author.isActive
    });
    setShowAuthorDialog(true);
  };

  const openArticleDialog = (article: Article) => {
    setSelectedArticle(article);
    setNewAuthorId('');
    setShowArticleDialog(true);
  };

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor) return;

    try {
      setUpdating(true);
      const { data: response } = await apiService.admin.deleteUser(selectedAuthor._id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Author deleted successfully",
        });
        setShowDeleteDialog(false);
        loadAuthors();
      } else {
        // Handle specific error cases
        if (response.error && response.error.includes('existing articles')) {
          toast({
            title: "Cannot Delete Author",
            description: "This author has articles that must be reassigned first. Please transfer their articles to another author before deleting.",
            variant: "destructive",
          });
        } else if (response.status === 400) {
          toast({
            title: "Cannot Delete Author",
            description: response.error || "This author cannot be deleted. Please check if they have articles or other dependencies.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to delete author",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error deleting author:', error);
      toast({
        title: "Error",
        description: "Failed to delete author",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteDialog = (author: Author) => {
    setSelectedAuthor(author);
    setShowDeleteDialog(true);
  };

  const filteredAuthors = authors.filter(author =>
    author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (author.firstName && author.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (author.lastName && author.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'editor': return 'default';
      case 'author': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">
              You do not have permission to access this page. Admin rights are required.
            </p>
            <p className="text-sm text-slate-500">
              Current role: {user?.role || 'Not logged in'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Author Management</h1>
                <p className="text-slate-500 mt-1">Manage authors and reassign article ownership</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => setShowAddAuthorDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Author
            </Button>
            <Button onClick={loadAuthors} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card key="total-authors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Authors</p>
                  <div className="text-2xl font-bold">{authors.length}</div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card key="active-authors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Authors</p>
                  <div className="text-2xl font-bold">{authors.filter(a => a.isActive).length}</div>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card key="total-articles">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                  <div className="text-2xl font-bold">{articles.length}</div>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card key="published-articles">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published Articles</p>
                  <div className="text-2xl font-bold">{articles.filter(a => a.status === 'published').length}</div>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Authors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Authors</CardTitle>
            <CardDescription>Manage author profiles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuthors.map((author) => (
                  <TableRow key={author._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={author.avatar} alt={author.username} />
                          <AvatarFallback>
                            {author.firstName && author.lastName
                              ? `${author.firstName[0]}${author.lastName[0]}`
                              : author.username.substring(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {author.firstName && author.lastName
                              ? `${author.firstName} ${author.lastName}`
                              : author.username
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">{author.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(author.role)}>
                        {author.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {author.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={author.isActive ? 'text-green-600' : 'text-red-600'}>
                          {author.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{author.articleCount || 0}</TableCell>
                    <TableCell>
                      {new Date(author.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAuthorDialog(author)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(author)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Articles for Author Reassignment */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>Quick access to change article authors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.slice(0, 10).map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{article.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>By: {article.author.name}</span>
                      <span>Status: {article.status}</span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openArticleDialog(article)}
                  >
                    Change Author
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Author Profile Update Dialog */}
        <Dialog open={showAuthorDialog} onOpenChange={setShowAuthorDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Author Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={authorForm.role}
                  onValueChange={(value) => setAuthorForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={authorForm.bio}
                  onChange={(e) => setAuthorForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Enter author bio..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={authorForm.avatar}
                  onChange={(e) => setAuthorForm(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="Enter avatar URL..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={authorForm.isActive}
                  onCheckedChange={(checked) => setAuthorForm(prev => ({ ...prev, isActive: checked as boolean }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAuthorDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAuthorProfile} disabled={updating}>
                {updating ? 'Updating...' : 'Update Profile'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Article Author Dialog */}
        <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Change Article Author</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Article</Label>
                <div className="p-3 border rounded-lg bg-muted">
                  <h4 className="font-medium">{selectedArticle?.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Current author: {selectedArticle?.author.name}
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="newAuthor">New Author</Label>
                <Select value={newAuthorId} onValueChange={setNewAuthorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author._id} value={author._id}>
                        {author.firstName && author.lastName
                          ? `${author.firstName} ${author.lastName} (${author.username})`
                          : author.username
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArticleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangeArticleAuthor} disabled={updating || !newAuthorId}>
                {updating ? 'Changing...' : 'Change Author'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Author Dialog */}
        <Dialog open={showAddAuthorDialog} onOpenChange={setShowAddAuthorDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Author</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={newAuthorData.username}
                  onChange={(e) => setNewAuthorData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="johndoe"
                />
              </div>
              <div>
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newAuthorData.email}
                  onChange={(e) => setNewAuthorData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="youremail@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newAuthorData.password}
                  onChange={(e) => setNewAuthorData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="new-bio">Bio *</Label>
                <Textarea
                  id="new-bio"
                  value={newAuthorData.bio}
                  onChange={(e) => setNewAuthorData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Enter author bio..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-role">Role</Label>
                <Select
                  value={newAuthorData.role}
                  onValueChange={(value) => setNewAuthorData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddAuthorDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAuthor} disabled={updating}>
                {updating ? 'Creating...' : 'Create Author'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Author Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Author</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">Are you sure you want to delete this author?</p>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone. All articles by this author will need to be reassigned.
                  </p>
                </div>
              </div>
              <div className="p-3 border rounded-lg bg-muted">
                <h4 className="font-medium">
                  {selectedAuthor?.firstName && selectedAuthor?.lastName
                    ? `${selectedAuthor.firstName} ${selectedAuthor.lastName}`
                    : selectedAuthor?.username
                  }
                </h4>
                <p className="text-sm text-muted-foreground">{selectedAuthor?.email}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAuthor}
                disabled={updating}
              >
                {updating ? 'Deleting...' : 'Delete Author'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
