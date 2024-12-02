import { useEffect, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    Container,
    Typography,
    Paper,
    Divider,
    ListItemText,
    Card,
    CardContent,
    Stack,
    CircularProgress,
} from "@mui/material";
import { Article } from "@/models/article.ts";
import { Create, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth.ts";
import { api } from "@/utils/axios.ts";
import useSiteStore from "@/stores/site.ts";

export default function HomePage() {
    const authStore = useAuthStore();
    const siteStore = useSiteStore();
    const navigator = useNavigate();

    const [articles, setArticles] = useState<Array<Article>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const articlesPerPage = 4; // 每页显示文章数量

    // 获取所有文章
    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await api().get(`/articles`);
            const r = res.data;
            setArticles(r.data); // 设置所有文章
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(); // 初次加载所有文章
    }, []);

    // 获取当前页显示的文章
    const getCurrentPageArticles = () => {
        const startIndex = (currentPage - 1) * articlesPerPage;
        return articles.slice(startIndex, startIndex + articlesPerPage);
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1); // 下一页
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // 上一页，最小为1
    };

    // 判断是否显示下一页按钮
    const isNextPageDisabled = (currentPage - 1) * articlesPerPage + getCurrentPageArticles().length == articles.length;
    
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* 页面标题和新建按钮 */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 4 }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        mb: 4,
                        color: "primary.main",
                    }}
                >
                    所有文章
                </Typography>

                {authStore?.user?.role === "admin" && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                            navigator("/articles/new");
                            siteStore.setCurrentTitle("新建文章");
                        }}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                        }}
                    >
                        新建文章
                    </Button>
                )}
            </Stack>

            {/* 文章列表 */}
            <Paper elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
                {loading ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <CircularProgress />
                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                            加载中...
                        </Typography>
                    </Box>
                ) : !articles.length ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            还没有写过文章
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => {
                                navigator("/articles/new");
                                siteStore.setCurrentTitle("新建文章");
                            }}
                        >
                            创建第一篇文章
                        </Button>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {getCurrentPageArticles().map((article: Article) => (
                            <Box key={article.id}>
                                <Divider />
                                <ListItem
                                    sx={{
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    <Card
                                        elevation={0}
                                        sx={{
                                            width: "100%",
                                            bgcolor: "transparent",
                                        }}
                                    >
                                        <CardContent sx={{ p: 2 }}>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Button
                                                    fullWidth
                                                    sx={{
                                                        textAlign: "left",
                                                        textTransform: "none",
                                                    }}
                                                    onClick={() => {
                                                        navigator(`/articles/${article.id}`);
                                                        siteStore.setCurrentTitle(article.title || "");
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={article.title}
                                                        primaryTypographyProps={{
                                                            variant: "h6",
                                                            color: "text.primary",
                                                        }}
                                                        secondary={new Date(
                                                            Number(article.created_at) * 1000
                                                        ).toLocaleString()}
                                                    />
                                                    <ListItemText
                                                        secondary={`作者: ${article.author?.username || "未知"}`}
                                                    />
                                                </Button>

                                                {authStore?.user?.role === "admin" && (
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => {
                                                            navigator(`/articles/${article.id}/edit`);
                                                            siteStore.setCurrentTitle("编辑");
                                                        }}
                                                        sx={{
                                                            ml: 2,
                                                            "&:hover": {
                                                                bgcolor: "primary.light",
                                                                color: "primary.contrastText",
                                                            },
                                                        }}
                                                    >
                                                        <Create />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                )}
            </Paper>

            {/* 上一页和下一页按钮 */}
            <Box display="flex" justifyContent="center" alignItems="center">
                <Button
                    variant="contained"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    sx={{ mr: 2 }}
                >
                    上一页
                </Button>

                {/* 当前页数 */}
                <Typography sx={{ mx: 2 }}>
                    {`当前页：${currentPage}`}
                </Typography>

                <Button
                    variant="contained"
                    onClick={handleNextPage}
                    disabled={isNextPageDisabled} // 如果当前页的文章少于4个，禁用下一页按钮
                    sx={{ ml: 2 }}
                >
                    下一页
                </Button>
            </Box>
        </Container>
    );
}