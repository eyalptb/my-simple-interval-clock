
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const Privacy = () => {
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
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-2">Analytics Cookies</h2>
                <p className="text-muted-foreground">
                  I might use Google Analytics to help me improve the site.<br />
                  Nothing specifically about your data, just combined data from everyone.<br />
                  I might offer a cookie to my Premium Users;<br />
                  you can OPTIONALLY set a cookie to remember you.<br />
                  You can find out more about cookies here:<br />
                  <a href="https://policies.google.com/technologies/cookies" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Google Cookie Policy
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Advertising Cookies</h2>
                <p className="text-muted-foreground">
                  I use Google AdSense for our advertising, which requires cookies to work.<br /><br />
                  Non-EU Visitors – cookies are used to show you personalised adverts based on the sites you've visited and your interests.<br /><br />
                  EU Visitors – only non-personalised adverts will be shown – and only cookies needed to make the service work are used – not related to your privacy.<br /><br />
                  You can change your Google AdSense advert preferences here:<br />
                  <a href="https://policies.google.com/technologies/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Google Ads Preferences
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Regular site users</h2>
                <p className="text-muted-foreground">
                  Apart from the cookies mentioned above,<br />
                  I don't ask for or store any personal information about you.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Premium site users</h2>
                <p className="text-muted-foreground">
                  Apart from the cookies mentioned above,<br />
                  I might store the data you submit (your settings, options, lists) in a secure database.<br />
                  Only the data you want is stored.<br />
                  This can be reviewed, edited, deleted by you at any time directly or by request.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">User Data</h2>
                <p className="text-muted-foreground">
                  You need to read and agree to my User Data Terms
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Contacting Me</h2>
                <p className="text-muted-foreground">
                  If you contact me I will not share your email address or details with anyone.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Changes to Privacy Policy</h2>
                <p className="text-muted-foreground">
                  I may, at any time, change this Privacy Policy with or without notice.<br />
                  Any modification will be effective immediately.<br />
                  Your continued use of our site and services constitutes your acceptance of the changes.<br /><br />
                  If you have any questions about My privacy policy, please feel free to contact me.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
