'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-dropdown-menu";


export default function Hero() {

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                access_key: "xk5b1-2q3b6-2k6z6-9v1b1",
                fName: (form.elements.namedItem('fName') as HTMLInputElement)?.value,
                lName: (form.elements.namedItem('lName') as HTMLInputElement)?.value,
                email: (form.elements.namedItem('email') as HTMLInputElement)?.value,
                message: (form.elements.namedItem('message') as HTMLInputElement)?.value,
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
                <h1 className="font-semibold text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                    Contact Us
                </h1>
            </div>

            <Card className="flex flex-col items-center justify-items content-around p-4">

                <Label className="font-bold text-xl mx-1">
                    Send Us a Message!
                </Label>
                <Label className="text-xs mx-1 my-1 mt-0">
                    Please fill in the form below to get in touch with us.
                </Label>

                <form onSubmit={handleSubmit}>
                    
                    <div>
                        <Card className="justify-content columns-2 border-transparent shadow-none my-4">
                            <Input type="text" name="fName" required placeholder="First name" className="shadow"/>
                            <Input type="text" name="lName" required placeholder="Last name" className="shadow"/>
                        </Card>
                    </div>
                    <div>
                        <Card className="justify-content my-4">
                            {/* <label htmlFor="email">Email</label> */}
                            <Input type="email" name="email" required placeholder="Email Address" className="shadow"/>
                        </Card>
                    </div>
                    <div>
                        <Card className="justify-content my-4">
                        {/* <label htmlFor="message">Message</label> */}
                            <Textarea name="message" required rows={9} placeholder="Message" className="shadow" style={{resize:'none'}}></Textarea>
                        </Card>
                    </div>
                    <Button type="submit" className="bg-black text-white items-center mt-0 w-full">Submit Form</Button>
                </form>
            </Card>

        </div>
    </main>
  );
}


