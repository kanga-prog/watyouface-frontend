import RegisterForm from "../components/RegisterForm";
import { mediaUrl, defaultAvatar } from "../utils/media";

export default function Register() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <RegisterForm />
    </div>
  );
}
