console.log('🔍 Debug Script - Test Hassan Frontend');

// Fonction pour tester les APIs directement
async function testAPIs() {
    const baseUrl = 'http://localhost:8000';
    
    try {
        console.log('1️⃣ Test API Employees...');
        const employeesResponse = await fetch(`${baseUrl}/api/statistics/debug-employees?t=${Date.now()}`);
        const employeesData = await employeesResponse.json();
        console.log('✅ Employees API:', employeesData);
        
        console.log('2️⃣ Test API Affectations...');
        const affectationsResponse = await fetch(`${baseUrl}/api/statistics/affectations-simple?t=${Date.now()}`);
        const affectationsData = await affectationsResponse.json();
        console.log('✅ Affectations API:', affectationsData);
        
        // Trouver Hassan
        const hassan = employeesData.employees?.find(emp => emp.email === 'hassan@gmail.com');
        const hassanAffectations = affectationsData.filter(aff => aff.user?.email === 'hassan@gmail.com');
        
        console.log('🎯 Hassan dans employés:', hassan);
        console.log('🎯 Hassan affectations:', hassanAffectations);
        
        if (hassan && hassanAffectations.length > 0) {
            console.log('✅ Hassan devrait être visible dans le frontend !');
        } else {
            console.log('❌ Problème avec les données Hassan');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// Fonction pour injecter et tester le frontend
function injectFrontendTest() {
    // Attendre que React soit chargé
    const checkInterval = setInterval(() => {
        // Chercher des éléments React
        const statsElements = document.querySelectorAll('[class*="Statistics"]');
        const employeeElements = document.querySelectorAll('[class*="employee"]');
        
        if (statsElements.length > 0 || employeeElements.length > 0) {
            clearInterval(checkInterval);
            
            console.log('🔍 Frontend détecté!');
            console.log('📊 Éléments trouvés:', {
                statsElements: statsElements.length,
                employeeElements: employeeElements.length
            });
            
            // Essayer d'accéder aux données React
            const reactRoot = document.querySelector('#root');
            if (reactRoot && reactRoot._reactInternalFiber) {
                console.log('🎯 React Fiber détecté');
            }
            
            // Compter les employés affichés
            const employeeCards = document.querySelectorAll('[class*="employee"], [class*="gradient-to-r from-gray-50"]');
            console.log(`👥 Cartes d'employés trouvées: ${employeeCards.length}`);
            
            // Log des titres des employés visibles
            employeeCards.forEach((card, index) => {
                const nameElement = card.querySelector('h3');
                const emailElement = card.querySelector('p');
                if (nameElement && emailElement) {
                    console.log(`  ${index + 1}. ${nameElement.textContent} (${emailElement.textContent})`);
                }
            });
        }
    }, 1000);
    
    // Timeout après 10 secondes
    setTimeout(() => {
        clearInterval(checkInterval);
        console.log('⏰ Timeout - Frontend non détecté');
    }, 10000);
}

// Lancer les tests
testAPIs();
injectFrontendTest();
