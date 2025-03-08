import pool from "../config/db.js"
// Add Blog (with multiple images handled as array)
export const addBlog = async (blogData) => {
  const { title, description, date, author, images, details } = blogData;
  const [result] = await pool.query(
    'INSERT INTO blogs (title, description, date, author, images, details) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, date, author, JSON.stringify(images), JSON.stringify(details)]
  );
  return result.insertId;
};

// Update Blog
export const updateBlog = async (id, blogData) => {
  const { title, description, date, author, images, details } = blogData;
  await pool.query(
    'UPDATE blogs SET title=?, description=?, date=?, author=?, images=?, details=? WHERE id=?',
    [title, description, date, author, JSON.stringify(images), JSON.stringify(details), id]
  );
};

// Delete Blog
export const deleteBlog = async (id) => {
  await pool.query('DELETE FROM blogs WHERE id=?', [id]);
};

// Get All Blogs (for portfolio page)
export const getAllBlogs = async () => {
  const [rows] = await pool.query('SELECT id, title, description, date, author, images FROM blogs');
  return rows.map(blog => ({
    ...blog,
    images: JSON.parse(blog.images)
  }));
};

// Get Single Blog (for detailed page)
const safeParseJSON = (data, fallback) => {
  try {
    const parsedData = JSON.parse(data);

    // If parsed data is not an array but should be (like images), wrap it
    return Array.isArray(parsedData) ? parsedData : [parsedData];
  } catch (error) {
    console.error("Error parsing JSON:", error.message);
    return fallback;
  }
};

export const getBlogById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM blogs WHERE id = ?", [id]);

  if (rows.length === 0) return null;

  const blog = rows[0];

  console.log("Fetched blog data:", blog); // Debugging

  return {
    ...blog,
    images: safeParseJSON(blog.images, []),
    details: safeParseJSON(blog.details, ""),
  };
};


export const getBlogByTitle = async (title) => {
  const decodedTitle = decodeURIComponent(title); // Decoding special characters
  const [rows] = await pool.query("SELECT * FROM blogs WHERE title = ?", [decodedTitle]);

  if (rows.length === 0) return null;

  const blog = rows[0];

  return {
      ...blog,
      images: safeParseJSON(blog.images, []),
      details: safeParseJSON(blog.details, ""),
  };
};

