
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" />
          Back
        </Button>

        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-2">Usage</h2>
                <p className="text-muted-foreground">
                  This is FREE to use for private and commercial use!<br /><br />
                  No need to contact me to request permission just use them how you want.<br />
                  If you're doing something cool with my tools, tell me, just because I would like to know
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
                <p className="text-muted-foreground">
                  You need to read and agree to my Privacy Policy.<br />
                  it explains how your personal data is used by me.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">User Data</h2>
                <p className="text-muted-foreground">
                  You need to read and agree to my User Data Terms.<br />
                  it explains how I store non-personal data you upload to the site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Browser Requirements</h2>
                <p className="text-muted-foreground">
                  I only support you emotionally<br />
                  hopefully my work will latest versions of the most popular browsers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">What's not allowed</h2>
                <p className="text-muted-foreground">
                  Don't change or modify my code.<br />
                  Don't remove or hide the "intervalclock.com" link<br />
                  Don't sell my work – it is free for everyone to use!<br />
                  BUT if you are selling a course / book / video – that uses one of our tools – that's fine.<br />
                  (As it's not actually the timer you are selling)
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Liability</h2>
                <p className="text-muted-foreground">
                  I take no responsibility for any losses or problems<br />
                  You use my site, services, tools at your own risk.<br />
                  This includes but is not limited to:<br />
                  loss of profits, inaccuracies, work stoppage, errors, access, loss of data,<br />
                  personal injury or property damage.<br />
                  I tried to make everything as accurate as possible,
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Changes</h2>
                <p className="text-muted-foreground">
                  I may, at any time, change these Terms with or without notice.<br />
                  Any modification will be effective immediately.<br />
                  Your continued use of my site and services constitutes your acceptance of these new Terms.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
