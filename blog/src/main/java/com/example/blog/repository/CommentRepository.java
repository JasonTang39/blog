package com.example.blog.repository;

import com.example.blog.model.Comment;
import com.example.blog.util.HibernateUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;

import java.util.List;

@ApplicationScoped  // 声明这是一个应用范围的 Bean，需要的地方可以使用 @Inject 注入
public class CommentRepository {

    public List<Comment> findByArticleId(Integer id) throws PersistenceException {
        EntityManager em = HibernateUtil.getEntityManager();
        List<Comment> comments = null;
        try {
            em.getTransaction().begin();  // 开始事务
            comments = em
                    .createQuery("SELECT c FROM Comment c WHERE c.articleId = :articleId", Comment.class)
                    .setParameter("articleId", id)
                    .getResultList();  // 查询指定文章的评论
            em.getTransaction().commit();  // 提交事务
        } catch (PersistenceException e) {
            em.getTransaction().rollback();  // 当出了异常时回滚事务
            throw new RuntimeException("", e);
        } finally {
            em.close();  // 关闭 EntityManager
        }
        return comments;
    }

    public void create(Comment comment) throws PersistenceException {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            em.getTransaction().begin();  // 开始事务
            em.persist(comment);  // 保存评论
            em.getTransaction().commit();  // 提交事务
        } catch (PersistenceException e) {
            em.getTransaction().rollback();  // 当出了异常时回滚事务
            throw new RuntimeException("", e);
        } finally {
            em.close();  // 关闭 EntityManager
        }
    }

    // 删除评论
    public void deleteByCommentId(Integer id) throws PersistenceException {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            em.getTransaction().begin();  // 开始事务
            Comment comment = em.find(Comment.class, id); // 查找要删除的评论
            if (comment != null) {
                em.remove(comment); // 删除评论
            }
            em.getTransaction().commit();  // 提交事务
        } catch (PersistenceException e) {
            em.getTransaction().rollback();  // 当出了异常时回滚事务
            throw new RuntimeException("", e);
        } finally {
            em.close();  // 关闭 EntityManager
        }
    }
}
