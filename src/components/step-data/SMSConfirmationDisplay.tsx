import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone } from "lucide-react";

interface SMSConfirmationDisplayProps {
  stepData: any;
}

const SMSConfirmationDisplay = ({ stepData }: SMSConfirmationDisplayProps) => {
  const smsData = stepData?.sms_confirmation || {};
  const clientPhone = stepData?.client_phone || smsData?.phone_number || "No disponible";
  const sentAt = smsData?.sent_at ? new Date(smsData.sent_at).toLocaleString('es-ES') : "No disponible";
  const isSimulated = smsData?.simulated || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Confirmación SMS Enviada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {isSimulated ? "Enviado (Simulado)" : "Enviado"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Teléfono:</span>
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span className="text-sm">{clientPhone}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Enviado:</span>
          <span className="text-sm">{sentAt}</span>
        </div>
        
        {isSimulated && (
          <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
            <p className="text-xs text-blue-700">
              📱 SMS simulado - En producción se enviaría el mensaje de confirmación al teléfono del cliente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSConfirmationDisplay;