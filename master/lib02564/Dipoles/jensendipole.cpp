#include "jensendipole.h"
#include "Utils/cglautils.h"
#include "Utils/miscellaneous.h"

using namespace std;
using namespace CGLA;

CGLA::Vec3f JensenDipole::evaluate(const CGLA::Vec3f &xi, const CGLA::Vec3f &wi, const CGLA::Vec3f &ni, const CGLA::Vec3f &xo, const Vec3f & wo, const CGLA::Vec3f &no)
{
    float ntr = material.indexOfRefraction;
    float nin = 1.0f; //air
    float eta = nin / ntr;
    float eta_sqr = eta * eta;
    float Fdr = -1.440 / eta_sqr + 0.71 / eta + 0.668 + 0.0636 * eta;
    float A = (1 + Fdr) / (1 - Fdr);

    Vec3f r = Vec3f(length(xo - xi));
    Vec3f zr = invertVec3f(material.reducedExtinctionCoefficent);
    Vec3f zv = zr * (1 + 4.0f/3.0f * A);
    Vec3f dr = sqrtVec3f(r * r + zr * zr);
    Vec3f dv = sqrtVec3f(r * r + zv * zv);

    Vec3f tr = material.transmissionCoefficient;
    Vec3f C1 = zr * (tr + invertVec3f(dr));
    Vec3f C2 = zv * (tr + invertVec3f(dv));

    Vec3f coeff = material.reducedAlbedo / (4.0f * M_PI);
    Vec3f real = (C1 / (dr * dr)) * expVec3f(- tr * dr);
    Vec3f virt = (C2 / (dv * dv)) * expVec3f(- tr * dv);

    Vec3f S = coeff * (real + virt);
    float Ti = fresnel_T(wi,ni,nin,ntr);
    float To = fresnel_T(wo,no,nin,ntr);

    S *= (1.0f/M_PI) * Ti * To;
    return S;
}
