import { useState } from "react";
import { Input } from "../../ui/input.jsx";
import { Button } from "../../ui/button.jsx";
import { useAuth } from "../../../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card.jsx";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleRegister = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match.');
            return
        }

        const registerData = {
            name: formData.name,
            email: formData.email,
            password: formData.password
        };
        register.mutate(registerData);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Register</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
                <Input
                    id="name"
                    name="name"
                    label="Name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name"
                    minLength={3}
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <Input
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />


            <Button
                type="submit"
                className="w-full"
                disabled={register.isPending}
            >
                {register.isPending ? 'Creating account...' : 'Create account'}
            </Button>
        </form>
        <p className="text-center">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
            </CardContent>
        </Card>
        </div>
    );
}

export default RegisterForm;