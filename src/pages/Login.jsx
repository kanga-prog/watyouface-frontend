import LoginForm from "../components/LoginForm";
import { mediaUrl, defaultAvatar } from "../utils/media";

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
}
