import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENVS } from '@util';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface BookRecommendation {
    title: string;
    author?: string;
    reasoning: string;
    genre?: string;
}

export class GeminiService {
    private static genAI: GoogleGenerativeAI | null = null;

    private static initializeClient() {
        if (!this.genAI && ENVS.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(ENVS.GEMINI_API_KEY);
        }
    }

    static async chat(messages: ChatMessage[], context?: string): Promise<string> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const conversationHistory = messages
            .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

        const prompt = context
            ? `Context: ${context}\n\nConversation:\n${conversationHistory}\n\nAssistant:`
            : `Conversation:\n${conversationHistory}\n\nAssistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    static async semanticSearch(
        query: string,
        books: Array<{ id: string; title: string; author: string; description?: string; genre?: string }>,
    ): Promise<Array<{ bookId: string; relevanceScore: number; reasoning: string }>> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const booksContext = books
            .map(
                (book, idx) =>
                    `${idx + 1}. ID: ${book.id}, Title: "${book.title}" by ${book.author}, Genre: ${
                        book.genre || 'Unknown'
                    }, Description: ${book.description || 'No description'}`,
            )
            .join('\n');

        const prompt = `You are a semantic search engine for a library. Given a search query and a list of books, return the most relevant books with a relevance score (0-100) and reasoning.

Search Query: "${query}"

Available Books:
${booksContext}

Analyze the query and find books that match based on:
1. Semantic meaning (not just keyword matching)
2. Topic relevance
3. Genre similarity
4. Author expertise
5. Description content

Return the top 10 most relevant books in JSON format:
[
  {
    "bookId": "book-id-here",
    "relevanceScore": 95,
    "reasoning": "Brief explanation of why this book is relevant"
  }
]

If no books are relevant, return an empty array. Only return books with relevance score >= 30.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Error parsing semantic search results:', error);
            return [];
        }
    }

    static async analyzeReadingTrends(
        checkoutHistory: Array<{
            bookTitle: string;
            bookAuthor: string;
            bookGenre?: string;
            checkoutDate: Date;
            returnDate?: Date;
        }>,
    ): Promise<string> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const historyContext = checkoutHistory
            .map((item) => {
                const returnStatus = item.returnDate
                    ? `Returned on ${item.returnDate.toLocaleDateString()}`
                    : 'Not returned yet';
                return `"${item.bookTitle}" by ${item.bookAuthor} (${
                    item.bookGenre || 'Unknown genre'
                }) - Checked out: ${item.checkoutDate.toLocaleDateString()}, ${returnStatus}`;
            })
            .join('\n');

        const prompt = `Analyze the following reading history and provide insights about reading trends, preferences, and patterns:

Reading History:
${historyContext}

Provide a comprehensive analysis including:
1. Genre preferences and patterns
2. Reading frequency and consistency
3. Author preferences
4. Seasonal or temporal patterns
5. Recommendations for future reading based on trends
6. Any interesting insights or observations

Keep your analysis engaging and actionable (3-5 paragraphs).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    static async generateBookDescription(
        title: string,
        author: string,
        genre?: string,
        existingDescription?: string,
    ): Promise<string> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let prompt = `Generate a compelling and informative book description for:

Title: "${title}"
Author: ${author}`;

        if (genre) {
            prompt += `\nGenre: ${genre}`;
        }

        if (existingDescription) {
            prompt += `\n\nExisting description (enhance and expand on this): ${existingDescription}`;
        }

        prompt += `\n\nCreate a description that:
1. Captures the essence and main themes of the book
2. Is engaging and makes readers want to pick it up
3. Is 2-3 paragraphs long
4. Avoids spoilers
5. Highlights what makes this book unique

Provide only the description, without any preamble or additional commentary.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    static async generateSmartNotification(context: {
        userName: string;
        notificationType:
            | 'new_recommendation'
            | 'overdue_reminder'
            | 'new_arrival'
            | 'reading_milestone'
            | 'personalized_insight';
        data: Record<string, any>;
    }): Promise<{ title: string; message: string }> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate a personalized, engaging notification message for a library user.

User Name: ${context.userName}
Notification Type: ${context.notificationType}
Context Data: ${JSON.stringify(context.data, null, 2)}

Create a notification with:
1. A catchy, brief title (max 60 characters)
2. A friendly, personalized message (2-3 sentences)
3. Appropriate tone for the notification type

Return in JSON format:
{
  "title": "Notification title here",
  "message": "Notification message here"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return {
                title: 'Notification',
                message: 'You have a new update from the library!',
            };
        } catch (error) {
            console.error('Error parsing notification:', error);
            return {
                title: 'Notification',
                message: 'You have a new update from the library!',
            };
        }
    }

    static async generateBookSummary(
        bookTitle: string,
        bookAuthor?: string,
        bookDescription?: string,
    ): Promise<string> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let prompt = `Generate a comprehensive and engaging summary for the book "${bookTitle}"`;

        if (bookAuthor) {
            prompt += ` by ${bookAuthor}`;
        }

        if (bookDescription) {
            prompt += `.\n\nExisting description: ${bookDescription}`;
        }

        prompt += `.\n\nProvide a summary that includes:
1. Main themes and topics
2. Key takeaways
3. Target audience
4. Why someone should read this book

Keep it concise but informative (2-3 paragraphs).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    static async recommendBooks(
        userPreferences: {
            favoriteGenres?: string[];
            favoriteAuthors?: string[];
            recentReads?: string[];
            interests?: string[];
        },
        availableBooks: Array<{ title: string; author: string; genre?: string; description?: string }>,
    ): Promise<BookRecommendation[]> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const booksContext = availableBooks
            .map((book, idx) => `${idx + 1}. "${book.title}" by ${book.author} (Genre: ${book.genre || 'Unknown'})`)
            .join('\n');

        const preferencesText = `
User Preferences:
- Favorite Genres: ${userPreferences.favoriteGenres?.join(', ') || 'Not specified'}
- Favorite Authors: ${userPreferences.favoriteAuthors?.join(', ') || 'Not specified'}
- Recent Reads: ${userPreferences.recentReads?.join(', ') || 'None'}
- Interests: ${userPreferences.interests?.join(', ') || 'Not specified'}
`;

        const prompt = `${preferencesText}

Available Books in Library:
${booksContext}

Based on the user's preferences and the available books, recommend the top 5 books they would most enjoy.
For each recommendation, provide:
1. The exact book title (from the list)
2. The author
3. A brief reasoning (2-3 sentences) explaining why this book matches their preferences

Format your response as a JSON array with this structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "reasoning": "Explanation here",
    "genre": "Genre"
  }
]

Only recommend books from the provided list.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Error parsing recommendations:', error);
            return [];
        }
    }

    static async analyzeBookCollection(
        books: Array<{ title: string; author: string; genre?: string; publicationYear?: number }>,
    ): Promise<string> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const booksContext = books
            .map(
                (book) =>
                    `"${book.title}" by ${book.author} (${book.genre || 'Unknown'}, ${
                        book.publicationYear || 'Unknown year'
                    })`,
            )
            .join('\n');

        const prompt = `Analyze this book collection and provide insights:

Books in Collection:
${booksContext}

Provide a comprehensive analysis including:
1. Genre distribution and diversity
2. Notable patterns or themes
3. Suggestions for expanding the collection
4. Any missing genres or authors that would complement this collection

Keep your analysis informative and actionable (3-4 paragraphs).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    static async generateReadingList(theme: string, numberOfBooks = 10): Promise<BookRecommendation[]> {
        this.initializeClient();

        if (!this.genAI) {
            throw new Error('Gemini API key not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Create a reading list of ${numberOfBooks} books on the theme: "${theme}".

For each book, provide:
1. Book title
2. Author name
3. Brief reasoning (why it fits the theme)
4. Genre

Format your response as a JSON array:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "reasoning": "Why this book fits the theme",
    "genre": "Genre"
  }
]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Error parsing reading list:', error);
            return [];
        }
    }
}
