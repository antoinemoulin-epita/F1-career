"use client";

import { useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { signIn } from "@/lib/auth/actions";

const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const emailField = useController({ name: "email", control: form.control });
    const passwordField = useController({ name: "password", control: form.control });

    const onSubmit = form.handleSubmit(async (values) => {
        setError(null);
        setIsSubmitting(true);
        try {
            const result = await signIn(values);
            if (result?.error) {
                setError(result.error);
            }
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-primary">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center gap-6">
                    <UntitledLogo />

                    <div className="text-center">
                        <h1 className="text-display-sm font-semibold text-primary">Connexion</h1>
                        <p className="mt-1 text-md text-tertiary">
                            Connectez-vous pour acceder a votre espace.
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
                    <Input
                        label="Email"
                        placeholder="email@exemple.com"
                        type="email"
                        isRequired
                        value={emailField.field.value}
                        onChange={emailField.field.onChange}
                        isInvalid={!!emailField.fieldState.error}
                        hint={emailField.fieldState.error?.message}
                    />

                    <Input
                        label="Mot de passe"
                        placeholder="Votre mot de passe"
                        type="password"
                        isRequired
                        value={passwordField.field.value}
                        onChange={passwordField.field.onChange}
                        isInvalid={!!passwordField.fieldState.error}
                        hint={passwordField.fieldState.error?.message}
                    />

                    {error && (
                        <p className="text-sm text-error-primary">{error}</p>
                    )}

                    <Button type="submit" size="md" isLoading={isSubmitting}>
                        Connexion
                    </Button>
                </form>
            </div>
        </div>
    );
}
