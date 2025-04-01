import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Store OTP in user_profiles
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        reset_otp: otp,
        reset_otp_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      throw updateError;
    }

    // Send password reset email using Supabase's resetPasswordForEmail
    const { error: emailError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }
    );

    if (emailError) {
      throw emailError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { email, otp, password } = await request.json();

    // Get profile and verify OTP
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify OTP
    if (
      !profile.reset_otp ||
      profile.reset_otp !== otp ||
      !profile.reset_otp_expires ||
      new Date(profile.reset_otp_expires) < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Update password using Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (updateError) {
      throw updateError;
    }

    // Clear OTP
    await supabase
      .from("user_profiles")
      .update({
        reset_otp: null,
        reset_otp_expires: null,
      })
      .eq("email", email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}