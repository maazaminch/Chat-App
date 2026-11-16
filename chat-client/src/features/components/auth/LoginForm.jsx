import { useState } from "react";
import { Input } from "../../ui/input.jsx";
import { Button } from "../../ui/button.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card.jsx";
import { Link } from "react-router-dom";

const LoginForm = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleLogin = (e) => {
        e.preventDefault();
        login.mutate(formData);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="flex flex-col gap-2">
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
                    <br />
                    <Input
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        minLength={8}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <br />
            <Button 
                type="submit" 
                className="w-full"
                disabled={login.isPending}
            >
                {login.isPending ? 'Logging in...' : 'Login'}
            </Button>
                </form>

                <p className="text-center">
                Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
            </p>
            </CardContent>
        </Card>
        </div>
    );
}

export default LoginForm;