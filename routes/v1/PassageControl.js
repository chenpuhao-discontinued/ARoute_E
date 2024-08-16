
const express = require('express');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// 创建一个连接到SQLite数据库的函数
function createConnection() {
  return new sqlite3.Database(path.join(__dirname, '../../ARoute.db'));
}

const db = createConnection();
// 创建一个API端点，查询passage表中的所有文章数并返回
router.get('/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS count FROM passage';
  db.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ count: row.count });
  });
});

//从System_info表的name列的home_assembly值中获取对应的value
router.get('/home_assembly', (req, res) => {
  const query = 'SELECT value FROM System_info WHERE name = "home_assembly"';
  db.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.json({ home_assembly: row.value });
  });
});

//从System_info表的name列的home_assembly值中写入对应的value
// routes/v1/PassageControl.js

router.post('/set_home_assembly', (req, res) => {
  const query = 'UPDATE System_info SET value = ? WHERE name = "home_assembly"';
  const components = JSON.stringify(req.body.components);
  db.run(query, [components], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'success' });
  });
});

// 创建一个API端点，查询passage表中所有文章的阅读数之和并返回
router.get('/total_reads', (req, res) => {
  const query = 'SELECT SUM(read) AS total_reads FROM passage';
  db.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ total_reads: row.total_reads });
  });
});

//返回所有标签
router.get('/tags', (req, res) => {
  const query = 'SELECT * FROM tab';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tags: rows });
  });
});

// 修改添加标签的API端点，参数为tag
router.post('/add_tag', (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    res.status(400).json({ error: 'Tag parameter is required' });
    return;
  }
  const query = 'INSERT INTO tab (name) VALUES (?)';
  db.run(query, [tag], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Tag added successfully', tagId: this.lastID });
  });
});

//添加文章 参数有创作者，创作时间，别名，标题，内容，阅读数，标签
router.post('/add_passage', (req, res) => {
  const author = req.query.author;
  const time = req.query.time;
  const alias = req.query.alias;
  const title = req.query.title;
  const content = req.query.content;
  const read = req.query.read;
  const tag = req.query.tag;
  const cover = req.query.cover;
  const post = req.query.post;
  const categorization = req.query.category;
  if (!author || !time || !alias || !title || !content || !read || !tag) {
    res.status(400).json({ error: 'All parameters are required' });
    return;
  }
  const query = 'INSERT INTO passage (categorization,creator, created_at, alias, title, content, "read", tab, cover,post) VALUES (?,?, ?, ?, ?, ?, ?, ?,?,?)';
  db.run(query, [categorization,author, time, alias, title, content, read, tag, cover, post], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Passage added successfully', passageId: this.lastID });
  });
});

//创建一个api端点，查询passage表中的所有文章并返回，返回信息包含创作者，创作时间，标题，阅读数，标签
router.get('/all_passages', (req, res) => {
  const query = 'SELECT categorization, creator,alias, created_at, title, "read", tab,post FROM passage';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ passages: rows });
  });
});

//删除特定标签
router.delete('/delete_tag', (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    res.status(400).json({ error: 'Tag parameter is required' });
    return;
  }
  const query = 'DELETE FROM tab WHERE name = ?';
  db.run(query, [tag], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Tag deleted successfully' });
  });
});

//将某一标签的所有文章的标签改为另一个标签
router.put('/change_tag', (req, res) => {
  const oldTag = req.query.oldTag;
  const newTag = req.query.newTag;
  if (!oldTag || !newTag) {
    res.status(400).json({ error: 'Both oldTag and newTag parameters are required' });
    return;
  }
  const query = 'UPDATE passage SET tab = ? WHERE tab = ?';
  db.run(query, [newTag, oldTag], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Tag changed successfully' });
  });
});
//某一标签是否有文章
router.get('/tag_has_passage', (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    res.status(400).json({ error: 'Tag parameter is required' });
    return;
  }
  const query = 'SELECT COUNT(*) AS count FROM passage WHERE tab = ?';
  db.get(query, [tag], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ hasPassage: row.count > 0 });
  });
});

//通过别名返回文章所有信息
router.get('/passage_by_alias', (req, res) => {
  const alias = req.query.alias;
  if (!alias) {
    res.status(400).json({ error: 'Alias parameter is required' });
    return;
  }
  const query = 'SELECT * FROM passage WHERE alias = ?';
  db.get(query, [alias], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ passage: row });
  });
});

//通过别名更新文章，参数有创作者，创作时间，标题，内容，标签
router.post('/update_passage', (req, res) => {
  const alias = req.query.alias;
  const author = req.query.author;
  const time = req.query.time;
  const title = req.query.title;
  const content = req.query.content;
  //分类
  const category = req.query.category;
  //发布
    const post = req.query.post;
  const tag = req.query.tag;
  if (!post||!category||!alias || !author || !time || !title || !content || !tag) {
    res.status(400).json({ error: 'All parameters are required' });
    return;
  }
  const query = 'UPDATE passage SET categorization = ?, post = ?, creator = ?, created_at = ?, title = ?, content = ?, tab = ? WHERE alias = ?';
  db.run(query, [category,post,author, time, title, content, tag, alias], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Passage updated successfully' });
  });
});
//通过别名删除文章
router.delete('/delete_passage', (req, res) => {
  const alias = req.query.alias;
  if (!alias) {
    res.status(400).json({ error: 'Alias parameter is required' });
    return;
  }
  const query = 'DELETE FROM passage WHERE alias = ?';
  db.run(query, [alias], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Passage deleted successfully' });
  });
});

//返回所有分类
router.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categorization';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ categories: rows });
  });
});

//添加分类
router.post('/add_category', (req, res) => {
  const category = req.query.category;
  if (!category) {
    res.status(400).json({ error: 'Category parameter is required' });
    return;
  }
  const query = 'INSERT INTO categorization (name) VALUES (?)';
  db.run(query, [category], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Category added successfully', categoryId: this.lastID });
  });
});
//分类是否有文章
router.get('/category_has_passage', (req, res) => {
  const category = req.query.category;
  if (!category) {
    res.status(400).json({ error: 'Category parameter is required' });
    return;
  }
  const query = 'SELECT COUNT(*) AS count FROM passage WHERE categorization = ?';
  db.get(query, [category], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ hasPassage: row.count > 0 });
  });
});
//删除分类
router.post('/delete_category', (req, res) => {
  const category = req.query.category;
  if (!category) {
    res.status(400).json({ error: 'Category parameter is required' });
    return;
  }
  const query = 'DELETE FROM categorization WHERE name = ?';
  db.run(query, [category], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Category deleted successfully' });
  });
});
//将某一分类的所有文章的分类改为另一个分类
router.post('/change_category', (req, res) => {
  const oldCategory = req.query.oldCategory;
  const newCategory = req.query.newCategory;
  if (!oldCategory || !newCategory) {
    res.status(400).json({ error: 'Both oldCategory and newCategory parameters are required' });
    return;
  }
  const query = 'UPDATE passage SET categorization = ? WHERE categorization = ?';
  db.run(query, [newCategory, oldCategory], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Category changed successfully' });
  });
});
module.exports = router;