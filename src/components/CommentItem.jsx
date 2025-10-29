// src/components/CommentItem.jsx
export default function CommentItem({ comment }) {
  return (
    <div className="flex space-x-3 py-2">
      <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
        {comment.authorUsername?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-medium text-sm">{comment.authorUsername}</p>
        <p className="text-gray-700 text-sm">{comment.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(comment.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}