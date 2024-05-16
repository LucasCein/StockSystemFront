import React from 'react';
import { Stepper, Step, StepLabel, Button, Box, Card, CardContent } from '@mui/material';
import CompararPS from './CompararPS';
import { PlanillasProvider } from './PlanillasContext';
import CompararPO from './CompararPO';
import Comparar from './Comparar';

const steps = ['Planilla Sistema', 'Planillas Op. Limpias', 'Planilla Final'];

const CompararPlanillas = () => {
    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const getStepContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return <CompararPS />;
            case 1:
                return <CompararPO />;
            case 2:
                return <Comparar></Comparar>;
            default:
                return 'Unknown stepIndex';
        }
    };

    return (
        <PlanillasProvider>
            <section>
                <Card sx={{ maxWidth: 1200, margin: 'auto', boxShadow: 3, mt: 5, mb: 5 }}>
                    <CardContent>
                        <Box sx={{ width: '100%' }}>
                            <Stepper activeStep={activeStep}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                {getStepContent(activeStep)}
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                <Button
                                    color="inherit"
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    sx={{ mr: 1 }}
                                >
                                    Back
                                </Button>
                                <Box sx={{ flex: '1 1 auto' }} />
                                {activeStep === steps.length - 1 ? (
                                    <Button onClick={handleReset}>Reset</Button>
                                ) : (
                                    <Button onClick={handleNext}>
                                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </section>
        </PlanillasProvider>
    );
};

export default CompararPlanillas;
