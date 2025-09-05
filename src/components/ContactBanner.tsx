import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';

interface ContactBannerProps {
  title?: string;
  description?: string;
}

export const ContactBanner: React.FC<ContactBannerProps> = ({ 
  title = "¿Te interesa nuestro servicio?",
  description = "Déjanos tu información y te contactaremos para mostrarte cómo podemos ayudarte a automatizar tu atención al cliente."
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu email para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simular envío de datos (aquí conectarías con tu backend)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Lead capturado:', formData);
      
      setIsSubmitted(true);
      toast({
        title: "¡Gracias por tu interés!",
        description: "Nos pondremos en contacto contigo pronto.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu información. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isSubmitted) {
    return (
      <Card className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              ¡Mensaje enviado!
            </h3>
            <p className="text-muted-foreground">
              Gracias por tu interés. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-center text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground text-sm">
          {description}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Contactar
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Al enviar tus datos, aceptas que te contactemos para brindarte información sobre nuestros servicios.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};