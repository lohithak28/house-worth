1. MongoDB Schema:
Song {
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  genre: { type: String },
  releaseDate: { type: Date }
}

2. Implementation Requirements:

- Connect to MongoDB (local or Atlas).
- Implement proper error handling.
- Add data validation.

3. API Response Format:
{
  success: boolean,
  data: object,
  message: string
}

Deliverables:
---------------
1. Mongoose Schema definition
2. CRUD operation implementations
3. Data validation middleware
4. Error handling