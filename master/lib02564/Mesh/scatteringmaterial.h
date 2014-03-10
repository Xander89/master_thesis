#ifndef SCATTERINGMATERIAL_H
#define SCATTERINGMATERIAL_H

#include "Material.h"

namespace Mesh{

class ScatteringMaterial : public Mesh::Material
{
public:
    ScatteringMaterial();
    ScatteringMaterial(Mesh::Material m, float indexOfRefraction, CGLA::Vec3f absorption, CGLA::Vec3f scattering, CGLA:: Vec3f meancosine);

    // base parameters
     float indexOfRefraction; //The usual assumption is that this can be intercheangeably the material ior or the ratio between it and air (ior = 1)
     CGLA::Vec3f absorption;
     CGLA::Vec3f scattering;
     CGLA::Vec3f meancosine;

    // derived parameters
     CGLA::Vec3f D;
     CGLA::Vec3f reducedExtinctionCoefficent;
     CGLA::Vec3f transmissionCoefficient;
     CGLA::Vec3f reducedScatteringCoefficient;
     float T12;
     float T21;
     float C_s;
     float C_s_inv;
     float C_E;
     float A;
     CGLA::Vec3f de;
     CGLA::Vec3f reducedAlbedo;
     CGLA::Vec3f extinctionCoefficient;

private:
    void computeCoefficients();
    float C_Sigma(float ni);
    float C_e(float ni);
};

}
#endif // SCATTERINGMATERIAL_H
