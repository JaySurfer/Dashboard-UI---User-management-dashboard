// app/dashboard/settings/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

import { User } from '@/lib/types';
import { profileSettingsSchema, passwordSettingsSchema } from '@/lib/schema';
import { fetchCurrentUser, updateCurrentUserProfile, changeCurrentUserPassword } from '@/lib/data'; // Import mock functions

type ProfileFormValues = z.infer<typeof profileSettingsSchema>;
type PasswordFormValues = z.infer<typeof passwordSettingsSchema>;

export default function SettingsPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // --- Fetch current user data on mount ---
    useEffect(() => {
        async function loadUser() {
            setIsFetching(true);
            setFetchError(null);
            try {
                const user = await fetchCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    // Reset profile form once user data is loaded
                    profileForm.reset({
                        name: user.name,
                        email: user.email, // Typically display email, maybe read-only
                        department: user.department || "",
                        location: user.location || "",
                    });
                } else {
                     setFetchError("Could not load user data.");
                     toast.error("Could not load user data.");
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                setFetchError("An error occurred while fetching user data.");
                toast.error("An error occurred while fetching user data.");
            } finally {
                setIsFetching(false);
            }
        }
        loadUser();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on mount

    // --- Profile Form ---
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSettingsSchema),
        defaultValues: { // Initial defaults before data loads
            name: "",
            email: "",
            department: "",
            location: "",
        },
    });

    async function onProfileSubmit(values: ProfileFormValues) {
        setIsSavingProfile(true);
        // Exclude email if it's not meant to be updated here
        const { email, ...updateData } = values;

        const promise = () => updateCurrentUserProfile(updateData);

        toast.promise(promise, {
            loading: "Saving profile...",
            success: (updatedUser) => {
                 if (updatedUser) {
                    setCurrentUser(updatedUser); // Update local state if needed
                    // Optionally reset form if desired, but might not be necessary
                    // profileForm.reset(updatedUser);
                     return "Profile updated successfully!";
                 } else {
                    throw new Error("Update failed - User not found"); // Force toast error
                 }
            },
            error: (err) => {
                console.error("Profile update error:", err);
                return "Failed to update profile.";
            },
            finally: () => {
                setIsSavingProfile(false);
            }
        });
    }

    // --- Password Form ---
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSettingsSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    async function onPasswordSubmit(values: PasswordFormValues) {
        setIsSavingPassword(true);
        const promise = () => changeCurrentUserPassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        });

         toast.promise(promise, {
            loading: "Changing password...",
            success: (result) => {
                 if (result.success) {
                    passwordForm.reset(); // Clear form on success
                    return result.message || "Password changed successfully!";
                 } else {
                     // Throw error to trigger the error state of toast
                     throw new Error(result.message || "Password change failed.");
                 }
            },
            error: (err: Error) => {
                console.error("Password change error:", err);
                 // Display specific error message from mock API or a generic one
                return err.message || "Failed to change password.";
            },
            finally: () => {
                setIsSavingPassword(false);
            }
        });
    }

    // --- Render Loading/Error State ---
    if (isFetching) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                 <Tabs defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                     <TabsContent value="profile">
                         <Card>
                            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                     </TabsContent>
                     {/* Add skeleton for password tab too if desired */}
                </Tabs>
            </div>
        );
    }

    if (fetchError || !currentUser) {
        return <p className="text-red-500">{fetchError || "User data not available."}</p>;
    }

    // --- Render Main Content ---
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Settings</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Public Profile</CardTitle>
                            <CardDescription>
                                Update your personal information. Your email address is used for login.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    {/* Name Field */}
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     {/* Email Field (Read Only Example) */}
                                    <FormField
                                        control={profileForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" readOnly {...field} className="bg-muted/50 cursor-not-allowed" />
                                                </FormControl>
                                                 <FormDescription>
                                                   Email cannot be changed here. Contact support if needed.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                      {/* Department Field */}
                                    <FormField
                                        control={profileForm.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Department</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your department (optional)" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     {/* Location Field */}
                                    <FormField
                                        control={profileForm.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your location (optional)" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Add Avatar Upload Placeholder if needed */}
                                    {/*
                                    <FormItem>
                                        <FormLabel>Profile Picture</FormLabel>
                                        <FormControl>...</FormControl>
                                        <FormDescription>Upload a new photo.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    */}

                                    <Button type="submit" disabled={isSavingProfile}>
                                        {isSavingProfile ? "Saving..." : "Update Profile"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Tab */}
                <TabsContent value="password" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Update your login password. Choose a strong, unique password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                     {/* Current Password */}
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Separator />
                                     {/* New Password */}
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                 <FormDescription>
                                                    Minimum 8 characters.
                                                 </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                      {/* Confirm New Password */}
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isSavingPassword}>
                                        {isSavingPassword ? "Updating..." : "Change Password"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}