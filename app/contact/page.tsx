'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-dropdown-menu";


export default function Hero() {

    async function handleSubmit(e) {
        e.preventDefault();
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: process.env.NEXT_PUBLIC_WEB3_PUBLIC_KEY,
                name: (e.target.fName.value+" "+e.target.lName.value),
                email: e.target.email.value,
                message: e.target.message.value,
            }),
        });
        const result = await response.json();
        if (result.success) {
            console.log(result);
        }
    }

  return (
    <main className="min-h-screen flex flex-col items-center items-fit">
        <div className="flex-1 w-full flex flex-col gap-10 items-center">
            <div className="flex flex-col gap-4 items-center px-4 md:px-8 pt-20">
                <h1 className="font-medium text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                    Contact Us
                </h1>
            </div>

            <Card className="items-center justify-items content-around">

                <Label className="font-bold text-xl mx-1">
                    Send Us a Message!
                </Label>
                <Label className="text-xs mx-1 my-1 mt-0">
                    Please fill in the form below to get in touch with us.
                </Label>

                <form onSubmit={handleSubmit}>
                    
                    <div>
                        <Card className="justify-content columns-2 m-1 border-transparent shadow-none">
                            <Input type="text" name="fName" required placeholder="First name" className="border-black border-2"/>
                            <Input type="text" name="lName" required placeholder="Last name" className="border-black border-2"/>
                        </Card>
                    </div>
                    <div>
                        <Card className="justify-content m-1">
                            {/* <label htmlFor="email">Email</label> */}
                            <Input type="email" name="email" required placeholder="Email Address" className="border-black border-2"/>
                        </Card>
                    </div>
                    <div>
                        <Card className="justify-content m-1">
                        {/* <label htmlFor="message">Message</label> */}
                            <Textarea name="message" required rows="3" placeholder="Message" className="border-black border-2"></Textarea>
                        </Card>
                    </div>
                    <Button type="submit" className="bg-black text-white items-center m-1 mt-0">Submit Form</Button>
                </form>
            </Card>

        </div>
    </main>
  );
}


