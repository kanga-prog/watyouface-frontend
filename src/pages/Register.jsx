import RegisterForm from "../components/RegisterForm";
import LegalFooter from "../components/LegalFooter";

export default function Register() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 items-center justify-center px-4">
        <RegisterForm />
      </div>
      <LegalFooter />
    </div>
  );
}
