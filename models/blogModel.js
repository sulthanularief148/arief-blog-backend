import pool from "../config/db.js"
// Add Blog (with multiple images handled as array)
export const addBlog = async (blogData) => {
  const { title, description, date, author, images, content, category } = blogData;
  const [result] = await pool.query(
    'INSERT INTO blogs (title, description, date, author, images, content, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, date, author, JSON.stringify(images), JSON.stringify(content), category]
  );
  return result.insertId;
};

// Update Blog
export const updateBlog = async (id, blogData) => {
  const { title, description, date, author, images, content, category } = blogData;
  await pool.query(
    'UPDATE blogs SET title=?, description=?, date=?, author=?, images=?, content=? WHERE id=?',
    [title, description, date, author, JSON.stringify(images), JSON.stringify(content), category,  id]
  );
};

// Delete Blog
export const deleteBlog = async (id) => {
  await pool.query('DELETE FROM blogs WHERE id=?', [id]);
};

// Get All Blogs (for portfolio page)
export const getAllBlogs = async () => {
  // const [rows] = await pool.query('SELECT id, title, description, date, author, images, slug FROM blogs');
  const [rows] = await pool.query("SELECT * FROM blogs");
  return rows.map(blog => ({
    ...blog,
    slug: blog.slug,
    images: JSON.parse(blog.images)
  }));
};


export const getBlogBySlug = async (slug) => {
  const [rows] = await pool.query("SELECT * FROM blogs WHERE slug = ?", [slug]);

  if (rows.length === 0) return null
  const blog = rows[0];
  return {
    ...blog,
    images: safeParseJSON(blog.images, []),
    details: safeParseJSON(blog.details, ""),
  };
};

const safeParseJSON = (data, fallback) => {
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};
// Get Single Blog (for detailed page)
// const safeParseJSON = (data, fallback) => {
//   try {
//     const parsedData = JSON.parse(data);
//     return Array.isArray(parsedData) ? parsedData : [parsedData];
//   } catch (error) {
//     console.error("Error parsing JSON:", error.message);
//     return fallback;
//   }
// };
export const getBlogById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM blogs WHERE id = ?", [id]);

  if (rows.length === 0) return null

  return {
    ...blog,
    images: safeParseJSON(blog.images, []),
    details: safeParseJSON(blog.details, ""),
  };
};
export const getBlogByTitle = async (title) => {
  const [rows] = await pool.query(
    "SELECT * FROM blogs WHERE BINARY title = ?",
    [title]
  );

  if (rows.length === 0) return null;

  const blog = rows[0];

  return {
    ...blog,
    images: safeParseJSON(blog.images, []),
    details: safeParseJSON(blog.details, ""),
  };
};


