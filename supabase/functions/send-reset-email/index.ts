import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetEmailRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: ResetEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Founder Flow <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #ffffff;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 40px;">
                        <img src="${Deno.env.get("VITE_SUPABASE_URL")}/storage/v1/object/public/founder-flow-logo.png" alt="Founder Flow" width="120" style="display: block;" />
                      </td>
                    </tr>
                    
                    <!-- Heading -->
                    <tr>
                      <td style="padding-bottom: 24px;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">Reset your password</h1>
                      </td>
                    </tr>
                    
                    <!-- Body text -->
                    <tr>
                      <td style="padding-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; line-height: 24px; color: #333;">
                          You recently requested to reset your password. Click the button below to choose a new one:
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Button -->
                    <tr>
                      <td style="padding-bottom: 24px;">
                        <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                    
                    <!-- Footer text -->
                    <tr>
                      <td style="padding-top: 24px; border-top: 1px solid #eee;">
                        <p style="margin: 0; font-size: 14px; line-height: 24px; color: #ababab;">
                          If you didn't request this, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-reset-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
